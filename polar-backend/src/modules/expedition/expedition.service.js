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
const getAll = async (query) => {
  let q = supabase
    .from('expeditions')
    .select(
      `
      *,
      leader:users!leader_id(name),
      created_by_user:users!created_by(name)
    `,
      { count: 'exact' }
    );

  // Conditional filters
  if (query.region) {
    q = q.eq('region', query.region);
  }

  if (query.status) {
    q = q.eq('status', query.status);
  }

  if (query.year) {
    q = q
      .gte('start_date', `${query.year}-01-01T00:00:00Z`)
      .lte('start_date', `${query.year}-12-31T23:59:59Z`);
  }

  if (query.search) {
    const search = query.search.trim();
    q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  // Sorting
  q = q.order(query.sortBy, { ascending: query.sortOrder === 'asc' });

  // Pagination
  const from = (query.page - 1) * query.limit;
  const to = from + query.limit - 1;
  q = q.range(from, to);

  const { data, error, count } = await q;

  if (error) {
    throw error;
  }

  const total = count || 0;
  const limit = query.limit;

  return {
    data: data || [],
    meta: {
      page: query.page,
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
    leader:users!leader_id(id, name, email),
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
  const { error } = await supabase.from('expeditions').delete().eq('id', id);

  if (error) {
    throw error;
  }

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
