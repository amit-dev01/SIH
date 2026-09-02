const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

const STATION_COORDS = {
  ANTARCTICA: [
    {
      name: 'Bharati Station',
      lat: -69.4075,
      lng: 76.1964,
      location: 'Larsemann Hills, East Antarctica',
      established: 2012,
      status: 'ACTIVE',
      keywords: ['bharati', 'larsemann', 'groenestrom']
    },
    {
      name: 'Maitri Station',
      lat: -70.7667,
      lng: 11.7333,
      location: 'Schirmacher Oasis, Queen Maud Land',
      established: 1989,
      status: 'ACTIVE',
      keywords: ['maitri', 'schirmacher', 'priyadarshini']
    },
    {
      name: 'Dakshin Gangotri',
      lat: -70.0920,
      lng: 12.0000,
      location: 'Dakshin Gangotri Ice Shelf',
      established: 1983,
      status: 'HISTORIC',
      keywords: ['dakshin gangotri', 'gangotri', 'ice shelf']
    },
    {
      name: 'India Bay Base',
      lat: -69.9833,
      lng: 11.9167,
      location: 'Princess Astrid Coast, Antarctica',
      established: 1983,
      status: 'SEASONAL',
      keywords: ['india bay', 'coastal depot', 'queen maud']
    }
  ],
  ARCTIC: [
    {
      name: 'Himadri Station',
      lat: 78.9231,
      lng: 11.9267,
      location: 'Ny-Ålesund, Svalbard, Norway',
      established: 2008,
      status: 'ACTIVE',
      keywords: ['himadri', 'ny-alesund', 'ny alesund', 'svalbard', 'spitsbergen']
    },
    {
      name: 'IndARC Mooring Observatory',
      lat: 78.9500,
      lng: 12.0167,
      location: 'Kongsfjorden Fjord, Arctic Ocean',
      established: 2014,
      status: 'ACTIVE',
      keywords: ['indarc', 'kongsfjorden', 'mooring', 'fjord']
    },
    {
      name: 'Gruvebadet Atmospheric Laboratory',
      lat: 78.9167,
      lng: 11.8833,
      location: 'Ny-Ålesund, Svalbard',
      established: 2015,
      status: 'ACTIVE',
      keywords: ['gruvebadet', 'atmospheric lab', 'aerosol lab']
    }
  ],
  HIMALAYA: [
    {
      name: 'Himansh Station',
      lat: 32.4042,
      lng: 77.6106,
      location: 'Chandra Basin, Sutri Dhaka, Himachal Pradesh (4,080m)',
      established: 2016,
      status: 'ACTIVE',
      keywords: ['himansh', 'chandra basin', 'chandra', 'spiti', 'sutri dhaka', 'lahaul', 'himachal']
    },
    {
      name: 'Siachen Glacier Observatory',
      lat: 35.4200,
      lng: 77.1000,
      location: 'Karakoram Range, Ladakh',
      established: 2009,
      status: 'ACTIVE',
      keywords: ['siachen', 'karakoram', 'ladakh']
    },
    {
      name: 'Chhota Shigri Glacier Camp',
      lat: 32.2833,
      lng: 77.5167,
      location: 'Chhota Shigri Glacier, Pir Panjal',
      established: 2002,
      status: 'SEASONAL',
      keywords: ['chhota shigri', 'shigri', 'pir panjal']
    },
    {
      name: 'Dokriani Glacier Station',
      lat: 30.8333,
      lng: 78.8333,
      location: 'Garhwal Himalaya, Uttarakhand',
      established: 2005,
      status: 'SEASONAL',
      keywords: ['dokriani', 'garhwal', 'uttarakhand', 'bhagirathi']
    }
  ],
  SOUTHERN_OCEAN: [
    {
      name: 'Southern Ocean Survey',
      lat: -60.0,
      lng: 60.0,
      location: 'Southern Ocean Survey Sector',
      established: 2004,
      status: 'OBSERVATORY',
      keywords: ['southern ocean', 'survey', 'sector']
    },
    {
      name: 'Prydz Bay Oceanographic Station',
      lat: -66.5000,
      lng: 75.0000,
      location: 'Prydz Bay, Coastal East Antarctica',
      established: 2004,
      status: 'SEASONAL',
      keywords: ['prydz bay', 'prydz', 'coastal survey']
    },
    {
      name: 'Southern Ocean Polar Front Station',
      lat: -55.0000,
      lng: 57.5000,
      location: 'Sub-Antarctic Polar Front',
      established: 2004,
      status: 'OBSERVATORY',
      keywords: ['polar front', 'sub-antarctic', 'transect']
    },
    {
      name: 'Kerguelen Convergence Observatory',
      lat: -49.3500,
      lng: 70.2167,
      location: 'Kerguelen Plateau',
      established: 2006,
      status: 'OBSERVATORY',
      keywords: ['kerguelen', 'convergence', 'plateau']
    }
  ]
};

/**
 * Helper to match an expedition to one or more stations based on text contents
 */
const getMatchingStations = (exp) => {
  const regionStations = STATION_COORDS[exp.region] || [];
  if (regionStations.length === 0) return [];

  const textToSearch = [
    exp.title || '',
    exp.description || '',
    exp.summary || '',
    exp.slug || ''
  ]
    .join(' ')
    .toLowerCase();

  const matched = [];

  for (const st of regionStations) {
    const hasKeywordMatch = (st.keywords || []).some((kw) => textToSearch.includes(kw));
    if (hasKeywordMatch) {
      matched.push(st);
    }
  }

  // If specific stations matched, return all matched stations
  if (matched.length > 0) {
    return matched;
  }

  // Otherwise, default to the primary (first) station of the region
  return [regionStations[0]];
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
    // a) Build station & expedition pins
    if (includeExpeditions) {
      let expQuery = supabase.from('expeditions').select(`
        id, title, region, status, slug, cover_image_url, start_date, description, summary,
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
      const allExpeditions = (!expError && Array.isArray(expeditions)) ? expeditions : [];

      const targetRegions = region && STATION_COORDS[region] ? [region] : Object.keys(STATION_COORDS);

      // Track which expeditions have been matched to at least one station
      const matchedExpeditionIds = new Set();

      for (const reg of targetRegions) {
        const stations = STATION_COORDS[reg] || [];
        for (const station of stations) {
          const slugId = station.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          // 1. Add permanent station pin
          pins.push({
            id: `station-${slugId}`,
            type: 'station',
            title: station.name,
            lat: station.lat,
            lng: station.lng,
            region: reg,
            location: station.location || null,
            established: station.established || null,
            status: station.status === 'ACTIVE' ? 'Active' : station.status === 'SEASONAL' ? 'Seasonal' : 'Decommissioned',
            url: `/map?station=${slugId}`
          });

          // 2. Find expeditions matching this specific station
          const matchingExps = allExpeditions.filter((exp) => {
            if (exp.region !== reg) return false;
            const textToSearch = [exp.title, exp.description, exp.summary, exp.slug].filter(Boolean).join(' ').toLowerCase();
            return (station.keywords || []).some((kw) => textToSearch.includes(kw));
          });

          if (matchingExps.length > 0) {
            matchingExps.forEach((exp) => {
              matchedExpeditionIds.add(exp.id);
              pins.push({
                type: 'expedition',
                id: exp.id,
                title: exp.title,
                lat: station.lat,
                lng: station.lng,
                stationName: station.name,
                location: station.location || null,
                established: station.established || null,
                region: exp.region,
                status: exp.status,
                photoCount: Array.isArray(exp.media) ? exp.media.length : 0,
                paperCount: Array.isArray(exp.publications) ? exp.publications.length : 0,
                coverImage: exp.cover_image_url || null,
                url: `/api/v1/expeditions/${exp.slug || exp.id}`
              });
            });
          } else {
            // Always show the permanent station pin even if no expedition is currently active for it
            pins.push({
              type: 'expedition',
              id: `station-${station.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              title: station.name,
              lat: station.lat,
              lng: station.lng,
              stationName: station.name,
              location: station.location || null,
              established: station.established || null,
              region: reg,
              status: station.status || 'ACTIVE',
              photoCount: 0,
              paperCount: 0,
              coverImage: null,
              url: null
            });
          }
        }
      }

      // If any expedition didn't match any specific keywords, attach it to its region's primary station
      allExpeditions.forEach((exp) => {
        if (!matchedExpeditionIds.has(exp.id)) {
          const primaryStation = STATION_COORDS[exp.region]?.[0];
          if (primaryStation) {
            pins.push({
              type: 'expedition',
              id: exp.id,
              title: exp.title,
              lat: primaryStation.lat,
              lng: primaryStation.lng,
              stationName: primaryStation.name,
              location: primaryStation.location || null,
              established: primaryStation.established || null,
              region: exp.region,
              status: exp.status,
              photoCount: Array.isArray(exp.media) ? exp.media.length : 0,
              paperCount: Array.isArray(exp.publications) ? exp.publications.length : 0,
              coverImage: exp.cover_image_url || null,
              url: `/api/v1/expeditions/${exp.slug || exp.id}`
            });
          }
        }
      });
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
 * 2. Get only expedition and station locations with stats
 */
const getExpeditions = async () => {
  const { data: expeditions, error } = await supabase.from('expeditions').select(`
    id, title, region, status, slug, cover_image_url, start_date, description, summary,
    media(id),
    publications(id)
  `);

  if (error) {
    throw error;
  }

  const pins = [];
  const allExpeditions = Array.isArray(expeditions) ? expeditions : [];
  const targetRegions = Object.keys(STATION_COORDS);
  const matchedExpeditionIds = new Set();

  for (const reg of targetRegions) {
    const stations = STATION_COORDS[reg] || [];
    for (const station of stations) {
      const matchingExps = allExpeditions.filter((exp) => {
        if (exp.region !== reg) return false;
        const textToSearch = [exp.title, exp.description, exp.summary, exp.slug].filter(Boolean).join(' ').toLowerCase();
        return (station.keywords || []).some((kw) => textToSearch.includes(kw));
      });

      if (matchingExps.length > 0) {
        matchingExps.forEach((exp) => {
          matchedExpeditionIds.add(exp.id);
          pins.push({
            type: 'expedition',
            id: exp.id,
            title: exp.title,
            lat: station.lat,
            lng: station.lng,
            stationName: station.name,
            location: station.location || null,
            established: station.established || null,
            region: exp.region,
            status: exp.status,
            photoCount: Array.isArray(exp.media) ? exp.media.length : 0,
            paperCount: Array.isArray(exp.publications) ? exp.publications.length : 0,
            coverImage: exp.cover_image_url || null,
            url: `/api/v1/expeditions/${exp.slug || exp.id}`
          });
        });
      } else {
        pins.push({
          type: 'expedition',
          id: `station-${station.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: station.name,
          lat: station.lat,
          lng: station.lng,
          stationName: station.name,
          location: station.location || null,
          established: station.established || null,
          region: reg,
          status: station.status || 'ACTIVE',
          photoCount: 0,
          paperCount: 0,
          coverImage: null,
          url: null
        });
      }
    }
  }

  allExpeditions.forEach((exp) => {
    if (!matchedExpeditionIds.has(exp.id)) {
      const primaryStation = STATION_COORDS[exp.region]?.[0];
      if (primaryStation) {
        pins.push({
          type: 'expedition',
          id: exp.id,
          title: exp.title,
          lat: primaryStation.lat,
          lng: primaryStation.lng,
          stationName: primaryStation.name,
          location: primaryStation.location || null,
          established: primaryStation.established || null,
          region: exp.region,
          status: exp.status,
          photoCount: Array.isArray(exp.media) ? exp.media.length : 0,
          paperCount: Array.isArray(exp.publications) ? exp.publications.length : 0,
          coverImage: exp.cover_image_url || null,
          url: `/api/v1/expeditions/${exp.slug || exp.id}`
        });
      }
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

