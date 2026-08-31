const supabase = require('../config/supabase');
const logger = require('./logger');

/**
 * Helper to extract storage path relative to any bucket
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/polar-media/photos/2026/abc.jpg" -> "photos/2026/abc.jpg"
 */
const extractStoragePath = (url, bucketName = 'polar-media') => {
  if (!url || typeof url !== 'string') return null;
  const delimiter = `${bucketName}/`;
  const parts = url.split(delimiter);
  if (parts.length > 1) {
    return parts.slice(1).join(delimiter).split('?')[0];
  }
  return url;
};

/**
 * Helper to parse comma-separated or array tags, check/create in DB, and return tag IDs
 */
const parseTags = async (tagsInput) => {
  if (!tagsInput) return [];

  let rawTags = [];
  if (Array.isArray(tagsInput)) {
    rawTags = tagsInput.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  } else if (typeof tagsInput === 'string') {
    rawTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  if (rawTags.length === 0) return [];

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
        logger.warn(`Error querying tag '${tag}': ${findError.message}`);
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

module.exports = {
  extractStoragePath,
  parseTags
};
