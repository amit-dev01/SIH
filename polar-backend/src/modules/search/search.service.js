const supabase = require('../../config/supabase');
const cache = require('../../utils/cache');
const logger = require('../../utils/logger');
const stationsService = require('../stations/stations.service');
const { BASELINE_DATASETS, BASELINE_KNOWLEDGE } = require('../assistant/assistant.service');

/**
 * 1. Unified search across Datasets, Knowledge (Publications), Media, Expeditions, and Stations
 */
const search = async (query) => {
  const { q, type, region, year, tags, page = 1, limit = 20 } = query;
  const sanitizedQ = (q || '').trim();
  const qLower = sanitizedQ.toLowerCase();

  // a) Check cache first
  const cacheKey = `search:${JSON.stringify({ q: sanitizedQ, type, region, year, tags, page, limit })}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Parse types
  const allEntityTypes = ['dataset', 'knowledge', 'media', 'expedition', 'station'];
  let requestedTypes = allEntityTypes;

  if (type && type !== 'all') {
    const splitTypes = type.split(',').map((t) => t.trim().toLowerCase());
    requestedTypes = splitTypes.map((t) => (t === 'publication' ? 'knowledge' : t));
  }

  let expeditions = [];
  let publications = [];
  let mediaItems = [];
  let datasets = [];
  let stations = [];

  try {
    // 1. Expeditions
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
      if (region) expQuery = expQuery.eq('region', region);
      if (year) {
        expQuery = expQuery
          .gte('start_date', `${year}-01-01T00:00:00Z`)
          .lte('start_date', `${year}-12-31T23:59:59Z`);
      }

      const { data, error } = await expQuery;
      if (!error && data) expeditions = data;
    }

    // 2. Knowledge (Publications + Baseline Knowledge)
    if (requestedTypes.includes('knowledge')) {
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
      if (!error && data) publications = data;

      // Include baseline knowledge matching query
      BASELINE_KNOWLEDGE.forEach((bk) => {
        if (!sanitizedQ || bk.title.toLowerCase().includes(qLower) || bk.description.toLowerCase().includes(qLower)) {
          if (!publications.some((p) => p.id === bk.id)) {
            publications.push({
              id: bk.id,
              title: bk.title,
              abstract: bk.description,
              published_date: '2024-01-15T00:00:00Z',
              journal: 'NCPOR Scientific Review'
            });
          }
        }
      });
    }

    // 3. Media
    if (requestedTypes.includes('media')) {
      let mediaQuery = supabase.from('media').select(`
        id, title, description, type, thumbnail_url,
        file_url, captured_at, created_at
      `);

      if (sanitizedQ) {
        mediaQuery = mediaQuery.or(`title.ilike.%${sanitizedQ}%,description.ilike.%${sanitizedQ}%`);
      }

      const { data, error } = await mediaQuery;
      if (!error && data) mediaItems = data;
    }

    // 4. Datasets
    if (requestedTypes.includes('dataset')) {
      let dsQuery = supabase.from('datasets').select(`
        id, title, description, format, created_at
      `);

      if (sanitizedQ) {
        dsQuery = dsQuery.or(`title.ilike.%${sanitizedQ}%,description.ilike.%${sanitizedQ}%`);
      }

      const { data, error } = await dsQuery;
      if (!error && data) datasets = data;

      // Include baseline datasets matching query
      BASELINE_DATASETS.forEach((bd) => {
        if (
          !sanitizedQ ||
          bd.title.toLowerCase().includes(qLower) ||
          bd.description.toLowerCase().includes(qLower) ||
          bd.discipline.toLowerCase().includes(qLower) ||
          bd.station.toLowerCase().includes(qLower)
        ) {
          if (!datasets.some((d) => d.id === bd.id)) {
            datasets.push({
              id: bd.id,
              title: bd.title,
              description: bd.description,
              format: 'NetCDF/CSV',
              created_at: '2024-02-01T00:00:00Z',
              region: bd.region,
              discipline: bd.discipline
            });
          }
        }
      });
    }

    // 5. Stations
    if (requestedTypes.includes('station')) {
      const allStations = stationsService.getAllStationsFlat();
      stations = allStations.filter((st) => {
        if (!sanitizedQ) return true;
        return (
          st.name.toLowerCase().includes(qLower) ||
          st.location.toLowerCase().includes(qLower) ||
          st.region.toLowerCase().includes(qLower) ||
          st.id.toLowerCase().includes(qLower)
        );
      });
    }
  } catch (err) {
    logger.error(`Search query execution error: ${err.message}`);
  }

  // Map to unified result format
  const results = [];

  if (requestedTypes.includes('expedition')) {
    expeditions.forEach((e) => {
      const desc = e.summary || e.description || '';
      results.push({
        id: e.id,
        type: 'expedition',
        title: e.title,
        description: desc.length > 220 ? desc.substring(0, 220) + '...' : desc,
        url: `/expeditions/${e.slug || e.id}`,
        score: 1.0,
        date: e.start_date || null,
        region: e.region || null,
        thumbnailUrl: e.cover_image_url || null
      });
    });
  }

  if (requestedTypes.includes('knowledge')) {
    publications.forEach((p) => {
      const desc = p.abstract || '';
      results.push({
        id: p.id,
        type: 'knowledge',
        title: p.title,
        description: desc.length > 220 ? desc.substring(0, 220) + '...' : desc,
        url: `/knowledge/${p.id}`,
        score: 1.0,
        date: p.published_date || null,
        category: p.journal || 'Research Paper'
      });
    });
  }

  if (requestedTypes.includes('media')) {
    mediaItems.forEach((m) => {
      const desc = m.description || '';
      results.push({
        id: m.id,
        type: 'media',
        title: m.title,
        description: desc.length > 220 ? desc.substring(0, 220) + '...' : desc,
        url: `/media/${m.id}`,
        score: 1.0,
        date: m.captured_at || m.created_at || null,
        thumbnailUrl: m.thumbnail_url || m.file_url || null
      });
    });
  }

  if (requestedTypes.includes('dataset')) {
    datasets.forEach((d) => {
      const desc = d.description || '';
      results.push({
        id: d.id,
        type: 'dataset',
        title: d.title,
        description: desc.length > 220 ? desc.substring(0, 220) + '...' : desc,
        url: `/datasets/${d.id}`,
        score: 1.0,
        date: d.created_at || null,
        format: d.format || null
      });
    });
  }

  if (requestedTypes.includes('station')) {
    stations.forEach((s) => {
      results.push({
        id: s.id,
        type: 'station',
        title: s.name,
        description: s.description,
        url: `/map?station=${s.id}`,
        score: 1.0,
        location: s.location,
        status: s.status,
        coordinates: s.coordinates
      });
    });
  }

  const counts = {
    all: results.length,
    dataset: datasets.length,
    knowledge: publications.length,
    media: mediaItems.length,
    expedition: expeditions.length,
    station: stations.length
  };

  const total = results.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
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

  // Check stations
  stationsService.getAllStationsFlat().forEach((st) => {
    if (st.name.toLowerCase().includes(sanitizedQ.toLowerCase())) {
      suggestions.push({ type: 'station', id: st.id, title: st.name });
    }
  });

  // Check baseline datasets
  BASELINE_DATASETS.forEach((bd) => {
    if (bd.title.toLowerCase().includes(sanitizedQ.toLowerCase())) {
      suggestions.push({ type: 'dataset', id: bd.id, title: bd.title });
    }
  });

  // Check baseline knowledge
  BASELINE_KNOWLEDGE.forEach((bk) => {
    if (bk.title.toLowerCase().includes(sanitizedQ.toLowerCase())) {
      suggestions.push({ type: 'knowledge', id: bk.id, title: bk.title });
    }
  });

  try {
    const [expRes, pubRes, mediaRes, dataRes] = await Promise.all([
      supabase.from('expeditions').select('id, title').ilike('title', `%${sanitizedQ}%`).limit(2),
      supabase.from('publications').select('id, title').ilike('title', `%${sanitizedQ}%`).limit(2),
      supabase.from('media').select('id, title').ilike('title', `%${sanitizedQ}%`).limit(2),
      supabase.from('datasets').select('id, title').ilike('title', `%${sanitizedQ}%`).limit(2)
    ]);

    (expRes.data || []).forEach((item) =>
      suggestions.push({ type: 'expedition', id: item.id, title: item.title })
    );
    (pubRes.data || []).forEach((item) =>
      suggestions.push({ type: 'knowledge', id: item.id, title: item.title })
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

  const finalSuggestions = suggestions.slice(0, 10);
  cache.set(cacheKey, finalSuggestions, 120);
  return finalSuggestions;
};

module.exports = {
  search,
  suggest
};
