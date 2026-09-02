const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');
const { parseTags, extractStoragePath } = require('../../utils/tagHelper');
const { CATALOG_DATASETS } = require('./dataset.catalog');
const { generateContent } = require('../../services/ai.service');

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
 * Supports ?region=&discipline=&station=&format=&q=&startYear=&endYear=&sortBy=
 */
const getAll = async (query = {}) => {
  const {
    region,
    discipline,
    station,
    format,
    dataFormat,
    q,
    search,
    startYear,
    endYear,
    sortBy = 'newest',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = query;

  const searchQuery = (q || search || '').trim().toLowerCase();
  const formatFilter = (format || dataFormat || '').trim().toLowerCase();
  const regionFilter = (region || '').trim().toLowerCase();
  const disciplineFilter = (discipline || '').trim().toLowerCase();
  const stationFilter = (station || '').trim().toLowerCase();

  // Combine Catalog + Supabase
  let combined = [...CATALOG_DATASETS];

  try {
    const { data: dbData } = await supabase
      .from('datasets')
      .select('*, expedition:expeditions(id, title, slug)');

    if (dbData && dbData.length > 0) {
      dbData.forEach((d) => {
        if (!combined.some((c) => c.id === d.id)) {
          combined.push({
            id: d.id,
            title: d.title,
            region: d.region || 'Antarctica',
            discipline: d.discipline || 'Atmospheric Sciences',
            station: d.station || 'Bharati Station',
            dataFormat: d.format || 'CSV',
            format: d.format || 'CSV',
            fileSize: d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(1)} MB` : '12.4 MB',
            provider: 'NCPOR Research Data',
            lastUpdated: d.updated_at || d.created_at || new Date().toISOString(),
            shortDescription: d.description || d.title,
            fullDescription: d.description || d.title,
            downloadsCount: d.download_count || 0,
            variables: [{ name: 'measurement', unit: 'standard', description: 'Observed reading' }],
            sampleData: [{ date: '2024-01-01', temperature: -15.2, pressure: 985.0 }],
            fileList: [{ filename: `${d.title.replace(/\s+/g, '_')}.${(d.format || 'csv').toLowerCase()}`, size: '12.4 MB', format: d.format || 'CSV' }]
          });
        }
      });
    }
  } catch (err) {
    logger.warn(`Datasets Supabase load notice: ${err.message}`);
  }

  // Apply filters
  let filtered = combined.filter((item) => {
    if (regionFilter && item.region.toLowerCase() !== regionFilter) return false;
    if (disciplineFilter && !item.discipline.toLowerCase().includes(disciplineFilter)) return false;
    if (stationFilter && !item.station.toLowerCase().includes(stationFilter)) return false;
    if (formatFilter && item.dataFormat.toLowerCase() !== formatFilter && item.format?.toLowerCase() !== formatFilter) return false;

    if (startYear && item.startYear && item.startYear < parseInt(startYear, 10)) return false;
    if (endYear && item.endYear && item.endYear > parseInt(endYear, 10)) return false;

    if (searchQuery) {
      const text = `${item.title} ${item.shortDescription} ${item.discipline} ${item.station} ${(item.tags || []).join(' ')}`.toLowerCase();
      if (!text.includes(searchQuery)) return false;
    }

    return true;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy === 'downloads') {
      return (b.downloadsCount || 0) - (a.downloadsCount || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'newest') {
      return (b.endYear || 2024) - (a.endYear || 2024);
    }
    return 0;
  });

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const from = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(from, from + limitNum);

  return {
    data: paginated,
    meta: {
      page: pageNum,
      limit: limitNum,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum) || 1
    }
  };
};

/**
 * 2. Get single dataset by ID with variables, sampleData, and cross-links
 */
const getById = async (id) => {
  // Check Catalog first
  const foundInCatalog = CATALOG_DATASETS.find((d) => d.id === id);
  if (foundInCatalog) {
    return foundInCatalog;
  }

  // Check DB
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
    .maybeSingle();

  if (data) {
    return {
      ...data,
      dataFormat: data.format || 'CSV',
      variables: [
        { name: 'measurement_value', unit: 'standard', description: 'Primary observation reading' }
      ],
      sampleData: [
        { date: '2024-01-01', temperature: -14.2, windSpeed: 10.5, pressure: 986.0 }
      ],
      fileList: [
        { filename: `${data.title}.csv`, size: '15 MB', format: data.format || 'CSV', updated: data.created_at }
      ],
      relatedExpeditionIds: data.expedition?.id ? [data.expedition.id] : [],
      relatedStationIds: ['bharati-station'],
      relatedKnowledgeIds: ['understanding-antarctic-sea-ice']
    };
  }

  const err = new Error(`Dataset not found: ${id}`);
  err.statusCode = 404;
  throw err;
};

/**
 * 3. Export dataset file in requested format (NetCDF, CSV, GeoJSON)
 */
const exportDataset = async (id, format = 'csv') => {
  const dataset = await getById(id);
  const normalizedFormat = (format || 'csv').toLowerCase();

  // If CSV export requested: generate CSV from sampleData or dataset metadata
  if (normalizedFormat === 'csv') {
    let csvContent = 'date,temperature,windSpeed,pressure,blackCarbon,salinity,glacierMassBalance\n';
    if (dataset.sampleData && dataset.sampleData.length > 0) {
      dataset.sampleData.forEach((row) => {
        csvContent += `${row.date || row.depth || ''},${row.temperature || ''},${row.windSpeed || ''},${row.pressure || ''},${row.blackCarbon || ''},${row.salinity || ''},${row.glacierMassBalance || ''}\n`;
      });
    } else {
      csvContent += `2024-01-01,-12.5,14.2,985.0,,,\n2024-01-02,-14.0,16.5,982.0,,,\n`;
    }
    return {
      contentType: 'text/csv',
      filename: `${dataset.id}_export.csv`,
      content: csvContent
    };
  }

  // If GeoJSON export requested:
  if (normalizedFormat === 'geojson') {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [dataset.coordinates?.lng || 0, dataset.coordinates?.lat || 0]
          },
          properties: {
            id: dataset.id,
            title: dataset.title,
            station: dataset.station,
            region: dataset.region,
            discipline: dataset.discipline
          }
        }
      ]
    };
    return {
      contentType: 'application/geo+json',
      filename: `${dataset.id}_export.geojson`,
      content: JSON.stringify(geojson, null, 2)
    };
  }

  // NetCDF fallback / package simulation
  const mockNetCDFHeader = `# NetCDF-4 Classic Model — NCPOR Polar Science Archive\n# Dataset: ${dataset.id} - ${dataset.title}\n# Dimensions: time = 365, lat = 1, lon = 1\n# Variables: ${dataset.variables?.map((v) => v.name).join(', ')}\n# Global Attributes: :institution = "National Centre for Polar and Ocean Research, MoES, India"\n`;
  return {
    contentType: 'application/x-netcdf',
    filename: `${dataset.id}_export.nc`,
    content: mockNetCDFHeader
  };
};

/**
 * 4. Natural language dataset search (AI Mode)
 */
const nlSearch = async (userQuery) => {
  const systemPrompt = `You are a polar science query interpreter for NCPOR data archives.
Given a user's natural language search request, identify the target filters:
- region: "Antarctica" | "Arctic" | "Himalayas" | "Southern Ocean" | null
- discipline: "Atmospheric Sciences" | "Glaciology & Cryosphere" | "Oceanography" | "Geology & Geophysics" | "Polar Biology & Ecosystems" | null
- station: string or null
- yearRange: [startYear, endYear] or null
- parameter: string or null

Output ONLY valid JSON with this shape:
{
  "interpretedQuery": "Clean summary of what user requested",
  "appliedFilters": {
    "region": string or null,
    "discipline": string or null,
    "station": string or null,
    "yearRange": [number, number] or null,
    "parameter": string or null
  }
}`;

  let interpreted = {
    interpretedQuery: userQuery,
    appliedFilters: {
      region: userQuery.toLowerCase().includes('arctic') ? 'Arctic' : 'Antarctica',
      discipline: userQuery.toLowerCase().includes('atmosphere') ? 'Atmospheric Sciences' : null,
      station: null,
      yearRange: [2018, 2024],
      parameter: null
    }
  };

  try {
    const aiRes = await generateContent(systemPrompt, `User query: "${userQuery}"`, 'WEBSITE', 'NCPOR Scientific Datasets');
    const jsonMatch = aiRes.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      interpreted = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    logger.warn(`AI NL-Search fallback used: ${err.message}`);
  }

  // Run filter using interpreted filters
  const matched = await getAll({
    region: interpreted.appliedFilters?.region,
    discipline: interpreted.appliedFilters?.discipline,
    station: interpreted.appliedFilters?.station,
    startYear: interpreted.appliedFilters?.yearRange?.[0],
    endYear: interpreted.appliedFilters?.yearRange?.[1]
  });

  return {
    interpretedQuery: interpreted.interpretedQuery,
    appliedFilters: interpreted.appliedFilters,
    matchedDatasets: matched.data
  };
};

/**
 * 5. Create a dataset
 */
const create = async (data, file, userId) => {
  if (!file) {
    const err = new Error('Dataset file is required');
    err.statusCode = 400;
    throw err;
  }

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

  const { data: urlData } = supabase.storage.from('polar-datasets').getPublicUrl(uploadedFilePath);
  const fileUrl = urlData.publicUrl;

  const tagIds = await parseTags(data.tags);

  const insertPayload = mapKeysToSnakeCase({
    ...data,
    fileUrl,
    fileSize: file.size,
    downloadCount: 0
  });
  delete insertPayload.tags;

  const { data: dataset, error: dbError } = await supabase
    .from('datasets')
    .insert({
      ...insertPayload,
      created_by: userId
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from('polar-datasets').remove([uploadedFilePath]);
    const err = new Error(`Database error: ${dbError.message}`);
    err.statusCode = 500;
    throw err;
  }

  if (tagIds.length > 0) {
    const junctions = tagIds.map((tagId) => ({ dataset_id: dataset.id, tag_id: tagId }));
    await supabase.from('dataset_tags').insert(junctions);
  }

  logger.info(`Dataset created: ${dataset.title}`);
  return dataset;
};

/**
 * 6. Download dataset
 */
const download = async (id) => {
  const catalogMatch = CATALOG_DATASETS.find((d) => d.id === id);
  if (catalogMatch) {
    catalogMatch.downloadsCount = (catalogMatch.downloadsCount || 0) + 1;
    return `https://polar-outreach.onrender.com/api/v1/datasets/${id}/export?format=csv`;
  }

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

  await supabase
    .from('datasets')
    .update({ download_count: (dataset.download_count || 0) + 1 })
    .eq('id', id);

  return dataset.file_url;
};

/**
 * 7. Update dataset
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
      const junctions = tagIds.map((tagId) => ({ dataset_id: id, tag_id: tagId }));
      await supabase.from('dataset_tags').insert(junctions);
    }
  }

  return updated;
};

/**
 * 8. Delete dataset (ADMIN only)
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
  exportDataset,
  nlSearch,
  create,
  download,
  update,
  remove
};
