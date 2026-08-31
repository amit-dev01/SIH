const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');
const { parseTags, extractStoragePath } = require('../../utils/tagHelper');

/**
 * Helper to convert camelCase keys to snake_case for DB fields
 */
const mapKeysToSnakeCase = (obj) => {
  const mapping = {
    publishedDate: 'published_date',
    expeditionId: 'expedition_id',
    pdfUrl: 'pdf_url'
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
 * 1. Get all publications with filtering, search, sorting and pagination
 */
const getAll = async (query) => {
  let q = supabase
    .from('publications')
    .select(
      `
      *,
      expedition:expeditions(id, title, slug),
      publication_tags(tag_id, tags(id, name, slug))
    `,
      { count: 'exact' }
    );

  if (query.expeditionId) {
    q = q.eq('expedition_id', query.expeditionId);
  }

  if (query.year) {
    q = q
      .gte('published_date', `${query.year}-01-01T00:00:00Z`)
      .lte('published_date', `${query.year}-12-31T23:59:59Z`);
  }

  if (query.search) {
    const s = query.search.trim();
    q = q.or(`title.ilike.%${s}%,abstract.ilike.%${s}%,journal.ilike.%${s}%`);
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

  let resultData = data || [];

  // If search was provided, also include in-memory author match fallback
  if (query.search) {
    const sLower = query.search.toLowerCase();
    resultData = resultData.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(sLower);
      const abstractMatch = item.abstract?.toLowerCase().includes(sLower);
      const journalMatch = item.journal?.toLowerCase().includes(sLower);
      const authorMatch = Array.isArray(item.authors)
        ? item.authors.some((a) => String(a).toLowerCase().includes(sLower))
        : false;
      return titleMatch || abstractMatch || journalMatch || authorMatch;
    });
  }

  const total = count || 0;
  return {
    data: resultData,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1
    }
  };
};

/**
 * 2. Get single publication by ID
 */
const getById = async (id) => {
  const { data, error } = await supabase
    .from('publications')
    .select(
      `
      *,
      expedition:expeditions(id, title, slug),
      publication_tags(tag_id, tags(id, name, slug))
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    const err = new Error('Publication not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

/**
 * 3. Create a publication (optional PDF file upload to polar-publications bucket)
 */
const create = async (data, pdfFile, userId) => {
  let uploadedPdfPath = null;
  let pdfUrl = data.pdfUrl || null;

  // a) Upload PDF if file provided
  if (pdfFile) {
    const year = new Date().getFullYear();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const sanitizedName = pdfFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    uploadedPdfPath = `pdfs/${year}/${uniqueId}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('polar-publications')
      .upload(uploadedPdfPath, pdfFile.buffer, {
        contentType: pdfFile.mimetype || 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      const err = new Error(`PDF upload failed: ${uploadError.message}`);
      err.statusCode = 500;
      throw err;
    }

    const { data: urlData } = supabase.storage
      .from('polar-publications')
      .getPublicUrl(uploadedPdfPath);
    pdfUrl = urlData.publicUrl;
  }

  // b) Parse tags
  const tagIds = await parseTags(data.tags);

  // c) Map fields to snake_case
  const insertPayload = mapKeysToSnakeCase({
    ...data,
    pdfUrl
  });
  delete insertPayload.tags;

  // d) Insert into publications table
  const { data: publication, error: dbError } = await supabase
    .from('publications')
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    // f) Clean up storage if DB insert fails
    if (uploadedPdfPath) {
      await supabase.storage.from('polar-publications').remove([uploadedPdfPath]);
    }
    const err = new Error(`Database error: ${dbError.message}`);
    err.statusCode = 500;
    throw err;
  }

  // e) Insert tag junctions into publication_tags
  if (tagIds.length > 0) {
    const junctions = tagIds.map((tagId) => ({
      publication_id: publication.id,
      tag_id: tagId
    }));
    const { error: junctionError } = await supabase.from('publication_tags').insert(junctions);
    if (junctionError) {
      logger.warn(`Failed to link tags to publication ${publication.id}: ${junctionError.message}`);
    }
  }

  logger.info(`Publication created: ${publication.title}`);
  return publication;
};

/**
 * 4. Update publication
 */
const update = async (id, data, userId, userRole) => {
  const { data: existing, error: findError } = await supabase
    .from('publications')
    .select('created_by')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Publication not found');
    err.statusCode = 404;
    throw err;
  }

  if (existing.created_by && existing.created_by !== userId && userRole !== 'ADMIN') {
    const err = new Error('Not authorized to edit this publication');
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
    .from('publications')
    .update(mappedData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  if (tagIds !== null) {
    await supabase.from('publication_tags').delete().eq('publication_id', id);
    if (tagIds.length > 0) {
      const junctions = tagIds.map((tagId) => ({
        publication_id: id,
        tag_id: tagId
      }));
      await supabase.from('publication_tags').insert(junctions);
    }
  }

  return updated;
};

/**
 * 5. Delete publication (ADMIN only)
 */
const remove = async (id, userRole) => {
  if (userRole !== 'ADMIN') {
    const err = new Error('Only administrators can delete publications');
    err.statusCode = 403;
    throw err;
  }

  const { data: publication, error: findError } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !publication) {
    const err = new Error('Publication not found');
    err.statusCode = 404;
    throw err;
  }

  // Remove PDF from storage if exists
  if (publication.pdf_url) {
    const storagePath = extractStoragePath(publication.pdf_url, 'polar-publications');
    if (storagePath) {
      await supabase.storage.from('polar-publications').remove([storagePath]);
    }
  }

  const { error: deleteError } = await supabase.from('publications').delete().eq('id', id);
  if (deleteError) {
    throw deleteError;
  }

  logger.info(`Publication deleted: ${id}`);
  return { message: 'Publication deleted' };
};

/**
 * 6. Get publication statistics
 */
const getStats = async () => {
  const { data: pubs, error } = await supabase
    .from('publications')
    .select('id, published_date, expedition:expeditions(id, title)');

  if (error) {
    throw error;
  }

  const currentYear = new Date().getFullYear();
  const last5Years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
  const byYear = {};
  last5Years.forEach((y) => {
    byYear[y] = 0;
  });

  const byExpedition = {};

  (pubs || []).forEach((p) => {
    if (p.published_date) {
      const y = new Date(p.published_date).getFullYear();
      if (byYear[y] !== undefined) {
        byYear[y]++;
      }
    }
    if (p.expedition?.title) {
      byExpedition[p.expedition.title] = (byExpedition[p.expedition.title] || 0) + 1;
    }
  });

  return {
    total: pubs?.length || 0,
    byYear,
    byExpedition
  };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getStats
};
