const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');
const { parseTags, extractStoragePath } = require('../../utils/tagHelper');

/**
 * Helper to convert camelCase keys to snake_case for DB fields
 */
const mapKeysToSnakeCase = (obj) => {
  const mapping = {
    expeditionId: 'expedition_id',
    fileUrl: 'file_url',
    fileSize: 'file_size',
    downloadCount: 'download_count'
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
 * 1. Get all datasets with filtering, search, sorting and pagination
 */
const getAll = async (query) => {
  let q = supabase
    .from('datasets')
    .select(
      `
      *,
      expedition:expeditions(id, title, slug),
      dataset_tags(tag_id, tags(id, name, slug))
    `,
      { count: 'exact' }
    );

  if (query.format) {
    q = q.eq('format', query.format);
  }

  if (query.expeditionId) {
    q = q.eq('expedition_id', query.expeditionId);
  }

  if (query.search) {
    const s = query.search.trim();
    q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
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
  return {
    data: data || [],
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1
    }
  };
};

/**
 * 2. Get single dataset by ID
 */
const getById = async (id) => {
  const { data, error } = await supabase
    .from('datasets')
    .select(
      `
      *,
      expedition:expeditions(id, title, slug),
      dataset_tags(tag_id, tags(id, name, slug))
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    const err = new Error('Dataset not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

/**
 * 3. Create a dataset (Requires file upload to polar-datasets bucket)
 */
const create = async (data, file, userId) => {
  if (!file) {
    const err = new Error('Dataset file is required');
    err.statusCode = 400;
    throw err;
  }

  // a) Upload file to Supabase Storage bucket "polar-datasets"
  const year = new Date().getFullYear();
  const formatFolder = (data.format || 'other').toLowerCase();
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uploadedFilePath = `${formatFolder}/${year}/${uniqueId}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from('polar-datasets')
    .upload(uploadedFilePath, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    const err = new Error(`Dataset upload failed: ${uploadError.message}`);
    err.statusCode = 500;
    throw err;
  }

  const { data: urlData } = supabase.storage
    .from('polar-datasets')
    .getPublicUrl(uploadedFilePath);
  const fileUrl = urlData.publicUrl;

  // b) Parse tags
  const tagIds = await parseTags(data.tags);

  // c) Map fields to snake_case
  const insertPayload = mapKeysToSnakeCase({
    ...data,
    fileUrl,
    fileSize: file.size,
    downloadCount: 0
  });
  delete insertPayload.tags;

  // d) Insert into datasets table
  const { data: dataset, error: dbError } = await supabase
    .from('datasets')
    .insert({
      ...insertPayload,
      created_by: userId
    })
    .select()
    .single();

  if (dbError) {
    // Clean up storage if DB insert fails
    await supabase.storage.from('polar-datasets').remove([uploadedFilePath]);
    const err = new Error(`Database error: ${dbError.message}`);
    err.statusCode = 500;
    throw err;
  }

  // e) Insert tag junctions into dataset_tags
  if (tagIds.length > 0) {
    const junctions = tagIds.map((tagId) => ({
      dataset_id: dataset.id,
      tag_id: tagId
    }));
    const { error: junctionError } = await supabase.from('dataset_tags').insert(junctions);
    if (junctionError) {
      logger.warn(`Failed to link tags to dataset ${dataset.id}: ${junctionError.message}`);
    }
  }

  logger.info(`Dataset created: ${dataset.title} (${dataset.format})`);
  return dataset;
};

/**
 * 4. Download dataset (Increments download counter and returns file URL)
 */
const download = async (id) => {
  const { data: dataset, error: findError } = await supabase
    .from('datasets')
    .select('id, file_url, download_count')
    .eq('id', id)
    .single();

  if (findError || !dataset) {
    const err = new Error('Dataset not found');
    err.statusCode = 404;
    throw err;
  }

  const newCount = (dataset.download_count || 0) + 1;
  const { error: updateError } = await supabase
    .from('datasets')
    .update({ download_count: newCount })
    .eq('id', id);

  if (updateError) {
    logger.warn(`Failed to increment download count for dataset ${id}: ${updateError.message}`);
  }

  return dataset.file_url;
};

/**
 * 5. Update dataset
 */
const update = async (id, data, userId, userRole) => {
  const { data: existing, error: findError } = await supabase
    .from('datasets')
    .select('created_by')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Dataset not found');
    err.statusCode = 404;
    throw err;
  }

  if (existing.created_by && existing.created_by !== userId && userRole !== 'ADMIN') {
    const err = new Error('Not authorized to edit this dataset');
    err.statusCode = 403;
    throw err;
  }

  let tagIds = null;
  if (data.tags !== undefined) {
    tagIds = await parseTags(data.tags);
  }

  const mappedData = mapKeysToSnakeCase(data);
  delete mappedData.tags;

  const { data: updated, error: updateError } = await supabase
    .from('datasets')
    .update(mappedData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  if (tagIds !== null) {
    await supabase.from('dataset_tags').delete().eq('dataset_id', id);
    if (tagIds.length > 0) {
      const junctions = tagIds.map((tagId) => ({
        dataset_id: id,
        tag_id: tagId
      }));
      await supabase.from('dataset_tags').insert(junctions);
    }
  }

  return updated;
};

/**
 * 6. Delete dataset (ADMIN only)
 */
const remove = async (id, userRole) => {
  if (userRole !== 'ADMIN') {
    const err = new Error('Only administrators can delete datasets');
    err.statusCode = 403;
    throw err;
  }

  const { data: dataset, error: findError } = await supabase
    .from('datasets')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !dataset) {
    const err = new Error('Dataset not found');
    err.statusCode = 404;
    throw err;
  }

  // Remove file from storage
  if (dataset.file_url) {
    const storagePath = extractStoragePath(dataset.file_url, 'polar-datasets');
    if (storagePath) {
      await supabase.storage.from('polar-datasets').remove([storagePath]);
    }
  }

  const { error: deleteError } = await supabase.from('datasets').delete().eq('id', id);
  if (deleteError) {
    throw deleteError;
  }

  logger.info(`Dataset deleted: ${id}`);
  return { message: 'Dataset deleted' };
};

module.exports = {
  getAll,
  getById,
  create,
  download,
  update,
  remove
};
