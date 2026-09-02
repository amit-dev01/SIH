const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

/**
 * UUID v4 / generic regex pattern check
 */
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof str === 'string' && uuidRegex.test(str);
};

/**
 * Helper to convert camelCase keys to snake_case for DB fields
 */
const mapKeysToSnakeCase = (obj) => {
  const mapping = {
    startDate: 'start_date',
    endDate: 'end_date',
    coverImageUrl: 'cover_image_url',
    leaderId: 'leader_id'
  };

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      const mappedKey = mapping[key] || key;
      result[mappedKey] = value;
    }
  }
  return result;
};

/**
 * Helper to generate a unique slug from title
 */
const generateSlug = async (title) => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const slug = baseSlug || 'expedition';
  let counter = 1;

  while (true) {
    const currentSlug = counter === 1 ? slug : `${slug}-${counter}`;
    const { data, error } = await supabase
      .from('expeditions')
      .select('id')
      .eq('slug', currentSlug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return currentSlug;
    }

    counter++;
  }
};

/**
 * 1. Get all expeditions with filtering, search, sorting and pagination
 */
const CATALOG_EXPEDITIONS = [
  {
    id: 'exp-ant-46',
    slug: 'exp-ant-46',
    title: '46th Indian Scientific Expedition to Antarctica (46th IAE)',
    expeditionNumber: '46th IAE',
    year: '2026-2027',
    region: 'Antarctica',
    leader: 'Polar Logistics & Scientific Coordination Committee',
    vesselOrBase: 'Maitri Station & Bharati Station',
    objectives: [
      'Operational deployment of automated weather telemetry network across Queen Maud Land',
      'Advanced 200m deep ice core palaeoclimate drilling in Dronning Maud Land',
      'Continuous magnetospheric storm and space weather monitoring during 2026 Solar Maximum',
      'Fast-ice altimetry and satellite ground truth calibration in Larsemann Hills'
    ],
    participatingScientists: 56,
    datasetsCollected: 18,
    summary: 'The active 46th IAE conducts year-round atmospheric, glaciological, and space weather observations across Maitri and Bharati stations, featuring real-time POLARIS data telemetry.',
    status: 'Ongoing',
    start_date: '2026-11-01T00:00:00Z',
    end_date: '2027-04-05T00:00:00Z',
    relatedDatasetIds: ['POL-ANT-2024-001', 'POL-ANT-2024-005'],
    relatedStationIds: ['maitri-station', 'bharati-station'],
    relatedKnowledgeIds: ['understanding-antarctic-sea-ice', 'indias-polar-research-programme'],
    relatedMediaIds: ['indias-latest-antarctic-research-expedition', 'up-1']
  },
  {
    id: 'exp-arc-18',
    slug: 'exp-arc-18',
    title: 'Indian Arctic Expedition 2026-2027',
    expeditionNumber: 'Arctic 2026-27',
    year: '2026-2027',
    region: 'Arctic',
    leader: 'Arctic Studies Group',
    vesselOrBase: 'Himadri Station (Ny-Ålesund, Svalbard)',
    objectives: [
      'Annual maintenance and sensor upgrade of IndARC subsurface oceanographic mooring',
      'Year-round black carbon mass absorption cross-section measurements at 78.92° N',
      'High-resolution hydrographic sampling of Kongsfjorden meltwater discharge'
    ],
    participatingScientists: 26,
    datasetsCollected: 14,
    summary: 'The 2026–2027 Arctic field campaign operates continuously at Himadri Station in Svalbard, generating real-time atmospheric aerosol profiles and fjord hydrography.',
    status: 'Ongoing',
    start_date: '2026-06-01T00:00:00Z',
    end_date: '2027-02-28T00:00:00Z',
    relatedDatasetIds: ['POL-ARC-2024-002'],
    relatedStationIds: ['himadri-station'],
    relatedKnowledgeIds: ['indias-polar-research-programme'],
    relatedMediaIds: ['up-2', 'vid-2']
  },
  {
    id: 'exp-ant-45',
    slug: 'exp-ant-45',
    title: '45th Indian Scientific Expedition to Antarctica (45th IAE)',
    expeditionNumber: '45th IAE',
    year: '2025-2026',
    region: 'Antarctica',
    leader: 'Dr. Rahul Kar',
    vesselOrBase: 'MV Vasiliy Golovnin & Maitri / Bharati Bases',
    objectives: [
      'Completion of geotechnical site surveys for the next-generation Maitri II station',
      'Deployment of autonomous lake monitoring buoys in Schirmacher Oasis'
    ],
    participatingScientists: 50,
    datasetsCollected: 42,
    summary: 'The 45th IAE successfully completed summer scientific operations, establishing autonomous lake monitoring buoys and delivering 42 open datasets to the POLARIS archive.',
    status: 'Completed',
    start_date: '2025-11-15T00:00:00Z',
    end_date: '2026-03-25T00:00:00Z'
  },
  {
    id: 'exp-so-13',
    slug: 'exp-so-13',
    title: '13th Southern Ocean Expedition (SOE-13)',
    expeditionNumber: '13th SOE',
    year: '2025-2026',
    region: 'Southern Ocean',
    leader: 'Ocean Sciences Division',
    vesselOrBase: 'ORV Sagar Kanya',
    objectives: [
      'Deep CTD hydrographic profile transect from 40°S down to 68°S',
      'Quantification of oceanic anthropogenic carbon uptake and DIC sinks'
    ],
    participatingScientists: 35,
    datasetsCollected: 28,
    summary: 'A 65-day deep ocean research cruise aboard ORV Sagar Kanya producing high-resolution CTD profiles and carbon flux inventories across the Indian sector of the Southern Ocean.',
    status: 'Completed',
    start_date: '2025-12-01T00:00:00Z',
    end_date: '2026-02-15T00:00:00Z'
  },
  {
    id: 'exp-ant-43',
    slug: 'exp-ant-43',
    title: '43rd Indian Scientific Expedition to Antarctica',
    expeditionNumber: '43rd IAE',
    year: '2023-2024',
    region: 'Antarctica',
    leader: 'Dr. Sailesh Agrawal',
    vesselOrBase: 'MV Vasiliy Golovnin & Maitri / Bharati Stations',
    objectives: [
      'Installation of automated weather station sensors in Schirmacher Oasis',
      'Palaeoclimate ice core drilling up to 100m depth in Dronning Maud Land'
    ],
    participatingScientists: 48,
    datasetsCollected: 36,
    summary: 'The 43rd IAE successfully deployed 48 scientists across Maitri and Bharati stations, collecting critical ice cores and automated weather observations.',
    status: 'Completed',
    start_date: '2023-11-15T00:00:00Z',
    end_date: '2024-03-25T00:00:00Z'
  },
  {
    id: 'exp-him-08',
    slug: 'exp-him-08',
    title: 'HIMANCHAL High-Mountain Asian Cryosphere Campaign',
    expeditionNumber: 'HIMANCHAL-08',
    year: '2025-2026',
    region: 'Himalayas',
    leader: 'Dr. Parmanand Sharma',
    vesselOrBase: 'Chhota Shigri & Sutri Dhaka High Altitude Stations',
    objectives: [
      'Glaciological mass balance stake measurements on Chhota Shigri Glacier',
      'DGPS surface ice velocity grid survey across accumulation zone'
    ],
    participatingScientists: 20,
    datasetsCollected: 16,
    summary: 'Integrated field campaign tracking Western Himalayan glacier ablation rates, seasonal meltwater discharge, and black carbon transport from the Indo-Gangetic Plains.',
    status: 'Completed',
    start_date: '2025-06-01T00:00:00Z',
    end_date: '2025-09-30T00:00:00Z'
  }
];

/**
 * 1. Get all expeditions with filtering, search, sorting and pagination
 */
const getAll = async (query) => {
  let combined = [...CATALOG_EXPEDITIONS];

  try {
    let q = supabase
      .from('expeditions')
      .select(`
        *,
        leader:users!leader_id(name),
        created_by_user:users!created_by(name)
      `);

    const { data: dbData } = await q;
    if (dbData && dbData.length > 0) {
      dbData.forEach((d) => {
        if (!combined.some((c) => c.id === d.id || c.slug === d.slug)) {
          combined.push(d);
        }
      });
    }
  } catch (err) {
    logger.warn(`Expeditions Supabase query notice: ${err.message}`);
  }

  // Filter
  let filtered = combined.filter((e) => {
    if (query.region && e.region?.toLowerCase() !== query.region.toLowerCase()) return false;
    if (query.status && e.status?.toLowerCase() !== query.status.toLowerCase()) return false;
    if (query.search) {
      const s = query.search.toLowerCase();
      const text = `${e.title} ${e.summary} ${e.leader} ${e.vesselOrBase}`.toLowerCase();
      if (!text.includes(s)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const page = query.page || 1;
  const limit = query.limit || 20;
  const from = (page - 1) * limit;
  const paginated = filtered.slice(from, from + limit);

  return {
    data: paginated,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

/**
 * 2. Get single expedition by UUID or slug
 */
const getByIdOrSlug = async (idOrSlug) => {
  const isIdUUID = isUUID(idOrSlug);

  let q = supabase.from('expeditions').select(`
    *,
    leader:users!leader_id(id, name),
    created_by_user:users!created_by(id, name),
    publications(id, title, doi, published_date),
    media(id, title, type, thumbnail_url, file_url),
    datasets(id, title, format, download_count)
  `);

  q = isIdUUID ? q.eq('id', idOrSlug) : q.eq('slug', idOrSlug);

  const { data, error } = await q.single();

  if (error || !data) {
    const err = new Error('Expedition not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

/**
 * 3. Create a new expedition
 */
const create = async (data, userId) => {
  const slug = await generateSlug(data.title);
  const mappedData = mapKeysToSnakeCase(data);

  const { data: expedition, error } = await supabase
    .from('expeditions')
    .insert({ ...mappedData, slug, created_by: userId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  logger.info(`Expedition created: ${expedition.title}`);
  return expedition;
};

/**
 * 4. Update an existing expedition
 */
const update = async (id, data, userId, userRole) => {
  const { data: existing, error: findError } = await supabase
    .from('expeditions')
    .select('created_by')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Expedition not found');
    err.statusCode = 404;
    throw err;
  }

  if (existing.created_by !== userId && userRole !== 'ADMIN') {
    const err = new Error('Not authorized to edit this expedition');
    err.statusCode = 403;
    throw err;
  }

  const mappedData = mapKeysToSnakeCase(data);

  const { data: expedition, error } = await supabase
    .from('expeditions')
    .update(mappedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return expedition;
};

/**
 * 5. Delete an expedition
 */
const remove = async (id) => {
  const { data: existing, error: findError } = await supabase
    .from('expeditions')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (findError || !existing) {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    throw err;
  }

  const { error } = await supabase.from('expeditions').delete().eq('id', id);

  if (error) {
    throw error;
  }

  logger.info(`Expedition deleted: ${id}`);
  return { message: 'Expedition deleted' };
};

/**
 * 6. Get expedition statistics
 */
const getStats = async (id) => {
  const { count: pubCount, error: pubErr } = await supabase
    .from('publications')
    .select('*', { count: 'exact', head: true })
    .eq('expedition_id', id);

  if (pubErr) throw pubErr;

  const { count: mediaCount, error: mediaErr } = await supabase
    .from('media')
    .select('*', { count: 'exact', head: true })
    .eq('expedition_id', id);

  if (mediaErr) throw mediaErr;

  const { count: datasetCount, error: dataErr } = await supabase
    .from('datasets')
    .select('*', { count: 'exact', head: true })
    .eq('expedition_id', id);

  if (dataErr) throw dataErr;

  const { data: downloads, error: dlErr } = await supabase
    .from('datasets')
    .select('download_count')
    .eq('expedition_id', id);

  if (dlErr) throw dlErr;

  const totalDownloads = downloads?.reduce((sum, d) => sum + (d.download_count || 0), 0) || 0;

  return {
    publications: pubCount || 0,
    media: mediaCount || 0,
    datasets: datasetCount || 0,
    totalDownloads
  };
};

module.exports = {
  generateSlug,
  getAll,
  getByIdOrSlug,
  create,
  update,
  remove,
  getStats
};
