const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

/**
 * Helper to extract storage path relative to the bucket
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/polar-media/photo/2026/abc.jpg" -> "photo/2026/abc.jpg"
 */
const extractStoragePath = (url) => {
  if (!url || typeof url !== 'string') return null;
  const parts = url.split('polar-media/');
  if (parts.length > 1) {
    return parts.slice(1).join('polar-media/').split('?')[0];
  }
  return url;
};

/**
 * Helper to parse comma-separated tags, find or create them in DB, and return tag IDs
 */
const parseTags = async (tagsString) => {
  if (!tagsString || typeof tagsString !== 'string') {
    return [];
  }

  const rawTags = tagsString
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  if (rawTags.length === 0) {
    return [];
  }

  // Deduplicate tags in input
  const uniqueTags = [...new Set(rawTags)];
  const tagIds = [];

  for (const tag of uniqueTags) {
    const slug = tag
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) continue;

    try {
      // 1. Check if tag exists
      const { data: existing, error: findError } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (findError) {
        logger.warn(`Error checking tag '${tag}': ${findError.message}`);
      }

      if (existing && existing.id) {
        tagIds.push(existing.id);
      } else {
        // 2. Insert new tag if not found
        const { data: newTag, error: insertError } = await supabase
          .from('tags')
          .insert({ name: tag, slug })
          .select('id')
          .single();

        if (insertError) {
          logger.warn(`Error creating tag '${tag}': ${insertError.message}`);
          // If collision occurred during parallel creation, try querying again
          const { data: retryTag } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();
          if (retryTag?.id) {
            tagIds.push(retryTag.id);
          }
        } else if (newTag?.id) {
          tagIds.push(newTag.id);
        }
      }
    } catch (tagErr) {
      logger.warn(`Failed to process tag '${tag}': ${tagErr.message}`);
    }
  }

  return tagIds;
};

/**
 * 1. Upload single media file (Validation, Storage upload, Thumbnail, DB insert, Tag associations)
 */
const upload = async (file, metadata, userId) => {
  // a) Validate MIME type matches declared type
  const mime = file.mimetype.toLowerCase();
  let isValidType = false;

  switch (metadata.type) {
    case 'PHOTO':
      isValidType = mime.startsWith('image/');
      break;
    case 'VIDEO':
      isValidType = mime.startsWith('video/');
      break;
    case 'DOCUMENT':
      isValidType =
        mime === 'application/pdf' ||
        mime === 'application/msword' ||
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mime.startsWith('text/');
      break;
    case 'AUDIO':
      isValidType = mime.startsWith('audio/');
      break;
    default:
      isValidType = false;
  }

  if (!isValidType) {
    const err = new Error('File type does not match declared type');
    err.statusCode = 400;
    throw err;
  }

  // b) Generate storage path
  const ext = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'bin';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const folder = metadata.type.toLowerCase();
  const year = new Date().getFullYear();
  const filePath = `${folder}/${year}/${uniqueName}.${ext}`;

  // c) Upload to Supabase Storage bucket "polar-media"
  const { error: uploadError } = await supabase.storage
    .from('polar-media')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    const err = new Error(`Upload failed: ${uploadError.message}`);
    err.statusCode = 500;
    throw err;
  }

  // d) Get public URL
  const { data: urlData } = supabase.storage.from('polar-media').getPublicUrl(filePath);
  const fileUrl = urlData.publicUrl;

  // e) Generate thumbnail for images only
  let thumbnailUrl = null;
  const thumbPath = `thumbnails/${year}/${uniqueName}.webp`;

  if (metadata.type === 'PHOTO') {
    try {
      const sharp = require('sharp');
      const thumbBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      const { error: thumbUploadError } = await supabase.storage
        .from('polar-media')
        .upload(thumbPath, thumbBuffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false
        });

      if (!thumbUploadError) {
        const { data: thumbUrlData } = supabase.storage
          .from('polar-media')
          .getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      } else {
        logger.warn(`Thumbnail upload failed: ${thumbUploadError.message}`);
      }
    } catch (thumbError) {
      logger.warn(`Thumbnail generation failed: ${thumbError.message}`);
    }
  }

  // f) Parse and handle tags
  const tagIds = await parseTags(metadata.tags);

  // g) Insert media record into database
  const { data: media, error: dbError } = await supabase
    .from('media')
    .insert({
      title: metadata.title,
      description: metadata.description || null,
      type: metadata.type,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      file_size: file.size,
      mime_type: file.mimetype,
      expedition_id: metadata.expeditionId || null,
      location_lat: metadata.locationLat !== undefined && metadata.locationLat !== '' ? metadata.locationLat : null,
      location_lng: metadata.locationLng !== undefined && metadata.locationLng !== '' ? metadata.locationLng : null,
      captured_at: metadata.capturedAt || null,
      uploaded_by: userId
    })
    .select()
    .single();

  if (dbError) {
    // Clean up: delete uploaded file and thumbnail from storage if DB insert fails
    await supabase.storage.from('polar-media').remove([filePath]);
    if (thumbnailUrl) {
      await supabase.storage.from('polar-media').remove([thumbPath]);
    }
    const err = new Error(`Database error: ${dbError.message}`);
    err.statusCode = 500;
    throw err;
  }

  // h) Insert tag junctions
  if (tagIds.length > 0) {
    const junctions = tagIds.map((tagId) => ({
      media_id: media.id,
      tag_id: tagId
    }));
    const { error: junctionError } = await supabase.from('media_tags').insert(junctions);
    if (junctionError) {
      logger.warn(`Failed to link tags to media ${media.id}: ${junctionError.message}`);
    }
  }

  // i) Log and return
  logger.info(`Media uploaded: ${media.title} (${metadata.type})`);
  return media;
};

/**
 * 2. Get all media with filtering, search, sorting and pagination
 */
const getAll = async (query) => {
  let q = supabase
    .from('media')
    .select(
      `
      *,
      expedition:expeditions(id, title, slug),
      uploaded_by_user:users!uploaded_by(name),
      media_tags(tag_id, tags(id, name, slug))
    `,
      { count: 'exact' }
    );

  if (query.type) {
    q = q.eq('type', query.type);
  }

  if (query.expeditionId) {
    q = q.eq('expedition_id', query.expeditionId);
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

  // In-memory tag filter fallback if tags query param passed
  if (query.tags) {
    const requestedTags = query.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (requestedTags.length > 0) {
      resultData = resultData.filter((item) => {
        const itemTags = (item.media_tags || [])
          .map((mt) => mt.tags?.slug?.toLowerCase() || mt.tags?.name?.toLowerCase())
          .filter(Boolean);
        return requestedTags.some((t) => itemTags.includes(t));
      });
    }
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
 * 3. Get single media by ID
 */
const getById = async (id) => {
  const { data, error } = await supabase
    .from('media')
    .select(
      `
      *,
      expedition:expeditions(id, title, slug),
      uploaded_by_user:users!uploaded_by(id, name),
      media_tags(tag_id, tags(id, name, slug))
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    const err = new Error('Media not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

/**
 * 4. Delete media by ID (Checks ownership / role, deletes from storage and DB)
 */
const remove = async (id, userId, userRole) => {
  // a) Fetch media to get file paths and check ownership
  const { data: media, error: findError } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !media) {
    const err = new Error('Media not found');
    err.statusCode = 404;
    throw err;
  }

  // c) Permission check
  if (media.uploaded_by !== userId && userRole !== 'ADMIN') {
    const err = new Error('Not authorized to delete this media');
    err.statusCode = 403;
    throw err;
  }

  // d) Extract storage paths
  const pathsToRemove = [];
  const mainFilePath = extractStoragePath(media.file_url);
  if (mainFilePath) {
    pathsToRemove.push(mainFilePath);
  }

  if (media.thumbnail_url) {
    const thumbFilePath = extractStoragePath(media.thumbnail_url);
    if (thumbFilePath) {
      pathsToRemove.push(thumbFilePath);
    }
  }

  // e) Delete from Storage
  if (pathsToRemove.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('polar-media')
      .remove(pathsToRemove);

    if (storageError) {
      logger.warn(`Storage removal failed: ${storageError.message}`);
    }
  }

  // f) Delete from DB (media_tags will cascade automatically if configured with ON DELETE CASCADE)
  const { error: dbError } = await supabase.from('media').delete().eq('id', id);

  if (dbError) {
    throw dbError;
  }

  logger.info(`Media deleted: ${id}`);
  return { message: 'Media deleted' };
};

/**
 * 5. Bulk upload multiple files
 */
const bulkUpload = async (files, rawMetadata, userId) => {
  let parsedMetadata = rawMetadata;

  if (typeof rawMetadata === 'string') {
    try {
      parsedMetadata = JSON.parse(rawMetadata);
    } catch (e) {
      parsedMetadata = {};
    }
  }

  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let fileMetadata;

    if (Array.isArray(parsedMetadata)) {
      fileMetadata = parsedMetadata[i] || parsedMetadata[0] || {};
    } else if (parsedMetadata && typeof parsedMetadata === 'object') {
      fileMetadata = {
        ...parsedMetadata,
        title: parsedMetadata.title ? `${parsedMetadata.title} (${i + 1})` : file.originalname
      };
    } else {
      fileMetadata = {
        title: file.originalname,
        type: 'PHOTO'
      };
    }

    try {
      const uploadedMedia = await upload(file, fileMetadata, userId);
      results.push({
        success: true,
        filename: file.originalname,
        data: uploadedMedia
      });
    } catch (err) {
      results.push({
        success: false,
        filename: file.originalname,
        error: err.message
      });
    }
  }

  return results;
};

module.exports = {
  extractStoragePath,
  parseTags,
  upload,
  getAll,
  getById,
  remove,
  bulkUpload
};
