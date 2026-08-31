const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

const STATION_COORDS = {
  ANTARCTIC: [
    { name: 'Bharati Station', lat: -69.4075, lng: 76.1964 },
    { name: 'Maitri Station', lat: -70.7667, lng: 11.7333 }
  ],
  ARCTIC: [
    { name: 'Himadri Station', lat: 78.9231, lng: 11.9267 }
  ],
  HIMALAYA: [
    { name: 'Siachen Glacier / Himansh', lat: 35.42, lng: 77.10 }
  ],
  SOUTHERN_OCEAN: [
    { name: 'Southern Ocean Survey', lat: -60.0, lng: 60.0 }
  ]
};

/**
 * 1. Fetch all geo-tagged data (Expedition base stations + geo-tagged media pins)
 */
const getLocations = async (query = {}) => {
  const { region, type, year } = query;
  const pins = [];

  const requestedType = (type || 'all').toLowerCase();
  const includeExpeditions =
    requestedType === 'all' || requestedType === 'expedition' || requestedType === 'expeditions';
  const includeMedia =
    requestedType === 'all' ||
    requestedType === 'media' ||
    ['photo', 'video', 'document', 'audio'].includes(requestedType);

  try {
    // a) Fetch expeditions
    if (includeExpeditions) {
      let expQuery = supabase.from('expeditions').select(`
        id, title, region, status, slug, cover_image_url, start_date,
        media(id),
        publications(id)
      `);

      if (region) {
        expQuery = expQuery.eq('region', region);
      }

      if (year) {
        expQuery = expQuery
          .gte('start_date', `${year}-01-01T00:00:00Z`)
          .lte('start_date', `${year}-12-31T23:59:59Z`);
      }

      const { data: expeditions, error: expError } = await expQuery;

      if (!expError && expeditions) {
        expeditions.forEach((exp) => {
          const coordsList = STATION_COORDS[exp.region] || [];
          if (coordsList.length > 0) {
            const primaryCoords = coordsList[0];
            pins.push({
              type: 'expedition',
              id: exp.id,
              title: exp.title,
              lat: primaryCoords.lat,
              lng: primaryCoords.lng,
              stationName: primaryCoords.name,
              region: exp.region,
              status: exp.status,
              photoCount: Array.isArray(exp.media) ? exp.media.length : 0,
              paperCount: Array.isArray(exp.publications) ? exp.publications.length : 0,
              coverImage: exp.cover_image_url || null,
              url: `/api/v1/expeditions/${exp.slug || exp.id}`
            });
          }
        });
      }
    }

    // b) Fetch geo-tagged media
    if (includeMedia) {
      let mediaQuery = supabase
        .from('media')
        .select(`
          id, title, type, thumbnail_url, file_url,
          location_lat, location_lng, captured_at,
          expedition:expeditions(id, title, slug, region)
        `)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null);

      if (type && ['PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(type.toUpperCase())) {
        mediaQuery = mediaQuery.eq('type', type.toUpperCase());
      }

      const { data: mediaItems, error: mediaError } = await mediaQuery;

      if (!mediaError && mediaItems) {
        mediaItems.forEach((m) => {
          if (
            typeof m.location_lat === 'number' &&
            typeof m.location_lng === 'number' &&
            !isNaN(m.location_lat) &&
            !isNaN(m.location_lng)
          ) {
            if (region && m.expedition?.region && m.expedition.region !== region) {
              return;
            }

            pins.push({
              type: 'media',
              id: m.id,
              title: m.title,
              lat: m.location_lat,
              lng: m.location_lng,
              mediaType: m.type,
              thumbnail: m.thumbnail_url || m.file_url,
              expeditionTitle: m.expedition?.title || null,
              date: m.captured_at,
              url: `/api/v1/media/${m.id}`
            });
          }
        });
      }
    }
  } catch (err) {
    logger.error(`Error fetching map locations: ${err.message}`);
  }

  return pins;
};

/**
 * 2. Get only expedition locations with stats
 */
const getExpeditions = async () => {
  const { data: expeditions, error } = await supabase.from('expeditions').select(`
    id, title, region, status, slug, cover_image_url, start_date,
    media(id),
    publications(id)
  `);

  if (error) {
    throw error;
  }

  const pins = [];

  (expeditions || []).forEach((exp) => {
    const coordsList = STATION_COORDS[exp.region] || [];
    if (coordsList.length > 0) {
      const primaryCoords = coordsList[0];
      pins.push({
        type: 'expedition',
        id: exp.id,
        title: exp.title,
        lat: primaryCoords.lat,
        lng: primaryCoords.lng,
        stationName: primaryCoords.name,
        region: exp.region,
        status: exp.status,
        photoCount: Array.isArray(exp.media) ? exp.media.length : 0,
        paperCount: Array.isArray(exp.publications) ? exp.publications.length : 0,
        coverImage: exp.cover_image_url || null,
        url: `/api/v1/expeditions/${exp.slug || exp.id}`
      });
    }
  });

  return pins;
};

/**
 * 3. Get only geo-tagged media pins
 */
const getMedia = async () => {
  const { data, error } = await supabase
    .from('media')
    .select(`
      id, title, type, thumbnail_url, file_url, location_lat, location_lng, captured_at,
      expedition:expeditions(id, title, slug, region)
    `)
    .not('location_lat', 'is', null)
    .not('location_lng', 'is', null)
    .order('captured_at', { ascending: false });

  if (error) {
    throw error;
  }

  const pins = [];

  (data || []).forEach((m) => {
    if (
      typeof m.location_lat === 'number' &&
      typeof m.location_lng === 'number' &&
      !isNaN(m.location_lat) &&
      !isNaN(m.location_lng)
    ) {
      pins.push({
        type: 'media',
        id: m.id,
        title: m.title,
        lat: m.location_lat,
        lng: m.location_lng,
        mediaType: m.type,
        thumbnail: m.thumbnail_url || m.file_url,
        expeditionTitle: m.expedition?.title || null,
        date: m.captured_at,
        url: `/api/v1/media/${m.id}`
      });
    }
  });

  return pins;
};

module.exports = {
  STATION_COORDS,
  getLocations,
  getExpeditions,
  getMedia
};
