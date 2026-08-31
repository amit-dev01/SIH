const supabase = require('../../config/supabase');
const cache = require('../../utils/cache');
const logger = require('../../utils/logger');

/**
 * 1. Unified search across Expeditions, Publications, Media, and Datasets
 */
const search = async (query) => {
  const { q, type, region, year, tags, page = 1, limit = 10 } = query;
  const sanitizedQ = (q || '').trim();

  // a) Check cache first
  const cacheKey = `search:${JSON.stringify({ q: sanitizedQ, type, region, year, tags, page, limit })}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Parse types
  const allTypes = ['expedition', 'publication', 'media', 'dataset'];
  const requestedTypes = type
    ? type.split(',').map((t) => t.trim().toLowerCase())
    : allTypes;

  let expeditions = [];
  let publications = [];
  let mediaItems = [];
  let datasets = [];

  try {
    // Search Expeditions
    if (requestedTypes.includes('expedition')) {
      let expQuery = supabase.from('expeditions').select(`
        id, title, description, summary, region,
        start_date, cover_image_url, slug
      `);

      if (sanitizedQ) {
        expQuery = expQuery.or(
          `title.ilike.%${sanitizedQ}%,description.ilike.%${sanitizedQ}%,summary.ilike.%${sanitizedQ}%`
        );
      }

      if (region) {
        expQuery = expQuery.eq('region', region);
      }

      if (year) {
        expQuery = expQuery
          .gte('start_date', `${year}-01-01T00:00:00Z`)
          .lte('start_date', `${year}-12-31T23:59:59Z`);
      }

      const { data, error } = await expQuery;
      if (!error && data) {
        expeditions = data;
      }
    }

    // Search Publications
    if (requestedTypes.includes('publication')) {
      let pubQuery = supabase.from('publications').select(`
        id, title, abstract, authors, published_date, journal
      `);

      if (sanitizedQ) {
        pubQuery = pubQuery.or(
          `title.ilike.%${sanitizedQ}%,abstract.ilike.%${sanitizedQ}%,journal.ilike.%${sanitizedQ}%`
        );
      }

      if (year) {
        pubQuery = pubQuery
          .gte('published_date', `${year}-01-01T00:00:00Z`)
          .lte('published_date', `${year}-12-31T23:59:59Z`);
      }

      const { data, error } = await pubQuery;
      if (!error && data) {
        publications = data;
      }
    }

    // Search Media
    if (requestedTypes.includes('media')) {
      let mediaQuery = supabase.from('media').select(`
        id, title, description, type, thumbnail_url,
        file_url, captured_at, created_at
      `);

      if (sanitizedQ) {
        mediaQuery = mediaQuery.or(
          `title.ilike.%${sanitizedQ}%,description.ilike.%${sanitizedQ}%`
        );
      }

      const { data, error } = await mediaQuery;
      if (!error && data) {
        mediaItems = data;
      }
    }

    // Search Datasets
    if (requestedTypes.includes('dataset')) {
      let dsQuery = supabase.from('datasets').select(`
        id, title, description, format, created_at
      `);

      if (sanitizedQ) {
        dsQuery = dsQuery.or(
          `title.ilike.%${sanitizedQ}%,description.ilike.%${sanitizedQ}%`
        );
      }

      const { data, error } = await dsQuery;
      if (!error && data) {
        datasets = data;
      }
    }
  } catch (err) {
    logger.error(`Search query execution error: ${err.message}`);
  }

  // d) Map to unified format
  const results = [];

  if (requestedTypes.includes('expedition') && expeditions.length > 0) {
    expeditions.forEach((e) => {
      const text = e.summary || e.description || '';
      results.push({
        type: 'expedition',
        id: e.id,
        title: e.title,
        snippet: text.length > 200 ? text.substring(0, 200) + '...' : text,
        thumbnailUrl: e.cover_image_url || null,
        date: e.start_date || null,
        region: e.region || null,
        url: `/api/v1/expeditions/${e.slug || e.id}`
      });
    });
  }

  if (requestedTypes.includes('publication') && publications.length > 0) {
    publications.forEach((p) => {
      const text = p.abstract || '';
      results.push({
        type: 'publication',
        id: p.id,
        title: p.title,
        snippet: text.length > 200 ? text.substring(0, 200) + '...' : text,
        thumbnailUrl: null,
        date: p.published_date || null,
        url: `/api/v1/publications/${p.id}`
      });
    });
  }

  if (requestedTypes.includes('media') && mediaItems.length > 0) {
    mediaItems.forEach((m) => {
      const text = m.description || '';
      results.push({
        type: 'media',
        id: m.id,
        title: m.title,
        snippet: text.length > 200 ? text.substring(0, 200) + '...' : text,
        thumbnailUrl: m.thumbnail_url || m.file_url || null,
        date: m.captured_at || m.created_at || null,
        url: `/api/v1/media/${m.id}`
      });
    });
  }

  if (requestedTypes.includes('dataset') && datasets.length > 0) {
    datasets.forEach((d) => {
      const text = d.description || '';
      results.push({
        type: 'dataset',
        id: d.id,
        title: d.title,
        snippet: text.length > 200 ? text.substring(0, 200) + '...' : text,
        thumbnailUrl: null,
        date: d.created_at || null,
        url: `/api/v1/datasets/${d.id}`
      });
    });
  }

  // e) Sort by date descending (null dates to the end)
  results.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  // f) Counts per type
  const counts = {
    expedition: expeditions.length,
    publication: publications.length,
    media: mediaItems.length,
    dataset: datasets.length
  };
  const total = results.length;

  // g) Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const from = (pageNum - 1) * limitNum;
  const paginatedResults = results.slice(from, from + limitNum);

  const responseData = {
    results: paginatedResults,
    counts,
    total,
    meta: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };

  // h) Cache for 2 minutes
  cache.set(cacheKey, responseData, 120);

  return responseData;
};

/**
 * 2. Autocomplete suggestions for search input
 */
const suggest = async (q) => {
  const sanitizedQ = (q || '').trim();
  if (sanitizedQ.length < 2) {
    return [];
  }

  const cacheKey = `suggest:${sanitizedQ.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const suggestions = [];

  try {
    const [expRes, pubRes, mediaRes, dataRes] = await Promise.all([
      supabase
        .from('expeditions')
        .select('id, title')
        .ilike('title', `%${sanitizedQ}%`)
        .limit(3),
      supabase
        .from('publications')
        .select('id, title')
        .ilike('title', `%${sanitizedQ}%`)
        .limit(3),
      supabase
        .from('media')
        .select('id, title')
        .ilike('title', `%${sanitizedQ}%`)
        .limit(3),
      supabase
        .from('datasets')
        .select('id, title')
        .ilike('title', `%${sanitizedQ}%`)
        .limit(3)
    ]);

    (expRes.data || []).forEach((item) =>
      suggestions.push({ type: 'expedition', id: item.id, title: item.title })
    );
    (pubRes.data || []).forEach((item) =>
      suggestions.push({ type: 'publication', id: item.id, title: item.title })
    );
    (mediaRes.data || []).forEach((item) =>
      suggestions.push({ type: 'media', id: item.id, title: item.title })
    );
    (dataRes.data || []).forEach((item) =>
      suggestions.push({ type: 'dataset', id: item.id, title: item.title })
    );
  } catch (err) {
    logger.warn(`Suggestion query error: ${err.message}`);
  }

  const finalSuggestions = suggestions.slice(0, 12);
  cache.set(cacheKey, finalSuggestions, 120);

  return finalSuggestions;
};

module.exports = {
  search,
  suggest
};
