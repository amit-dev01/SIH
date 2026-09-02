const { STATION_COORDS } = require('../map/map.service');

// Slug ID overrides — frontend expects these specific IDs
const ID_OVERRIDES = {
  'indarc-mooring-observatory': 'indarc-mooring'
};

const NATIVE_NAMES = {
  'bharati-station': 'भारती',
  'maitri-station': 'मैत्री',
  'dakshin-gangotri': 'दक्षिण गंगोत्री',
  'himadri-station': 'हिमाद्रि',
  'himansh-station': 'हिमांशु',
  'indarc-mooring': 'इंडआर्क'
};

const ELEVATIONS = {
  'bharati-station': '35 m a.s.l.',
  'maitri-station': '117 m a.s.l.',
  'dakshin-gangotri': 'Sea level / Ice shelf',
  'himadri-station': '15 m a.s.l.',
  'himansh-station': '4,080 m a.s.l.',
  'siachen-glacier-observatory': '5,400 m a.s.l.',
  'indarc-mooring': '-192 m (Sub-surface)'
};

const STATION_BACKGROUNDS = {
  'bharati-station': 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
  'maitri-station': 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
  'himadri-station': 'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80',
  'himansh-station': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'indarc-mooring': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
};

// Generate slug IDs from station names
const slugify = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return ID_OVERRIDES[slug] || slug;
};

// Flatten all stations from all regions into one list with complete POLARIS fields
const getAllStationsFlat = () => {
  const all = [];
  for (const [region, stations] of Object.entries(STATION_COORDS)) {
    stations.forEach((s) => {
      const slugId = slugify(s.name);
      const obs = generateObservation(region, s.status);
      const datasetCount = getRelatedDatasetsForStation(slugId).length || (s.status === 'ACTIVE' ? 3 : 0);

      all.push({
        id: slugId,
        stationId: `station-${slugId}`,
        name: s.name,
        native_name: NATIVE_NAMES[slugId] || null,
        nativeName: NATIVE_NAMES[slugId] || null,
        region: region.charAt(0) + region.slice(1).toLowerCase(), // e.g. "Antarctica"
        country: 'India',
        agency: 'National Centre for Polar and Ocean Research (NCPOR / MoES)',
        lat: s.lat,
        lng: s.lng,
        coordinates: { lat: s.lat, lng: s.lng },
        location: s.location,
        established: s.established,
        status:
          s.status === 'ACTIVE'
            ? 'Active'
            : s.status === 'SEASONAL'
            ? 'Seasonal'
            : s.status === 'HISTORIC'
            ? 'Decommissioned'
            : 'Observatory',
        elevation: ELEVATIONS[slugId] || '20 m a.s.l.',
        description: `${s.name} is an Indian polar research base located at ${s.location}, operated by NCPOR under the Ministry of Earth Sciences.`,
        image_bg: STATION_BACKGROUNDS[slugId] || 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
        imageBg: STATION_BACKGROUNDS[slugId] || 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
        parameters: ['Surface Meteorology', 'Radiation Flux', 'Seismology', 'Ozone Monitoring', 'Aerosols'],
        available_datasets_count: datasetCount,
        availableDatasetsCount: datasetCount,
        temp_latest: obs ? `${obs.temp}°C` : 'N/A',
        wind_latest: obs ? `${obs.wind} m/s ENE` : 'N/A',
        pressure_latest: obs ? `${obs.pressure} hPa` : 'N/A',
        observation_updated_at: obs?.updatedAt || new Date().toISOString(),
        latestObservation: obs,
        // Connected knowledge graph links
        related_expedition_ids: getRelatedExpeditionsForStation(slugId),
        relatedExpeditionIds: getRelatedExpeditionsForStation(slugId),
        related_dataset_ids: getRelatedDatasetsForStation(slugId),
        relatedDatasetIds: getRelatedDatasetsForStation(slugId),
        related_media_ids: [],
        relatedMediaIds: []
      });
    });
  }
  return all;
};

const getRelatedExpeditionsForStation = (stationId) => {
  if (stationId === 'maitri-station' || stationId === 'bharati-station') {
    return ['exp-43-iae', 'exp-44-iae', '43rd-indian-scientific-expedition-to-antarctica'];
  }
  if (stationId === 'himadri-station' || stationId === 'indarc-mooring') {
    return ['exp-16-arctic', 'indian-arctic-winter-expedition-2024'];
  }
  if (stationId === 'himansh-station') {
    return ['exp-him-08', 'himalayan-cryosphere-survey-chandra-basin'];
  }
  return [];
};

const getRelatedDatasetsForStation = (stationId) => {
  if (stationId === 'bharati-station') return ['POL-ANT-2024-001', 'POL-ANT-2024-006'];
  if (stationId === 'maitri-station') return ['POL-ANT-2024-005'];
  if (stationId === 'himadri-station') return ['POL-ARC-2024-002'];
  if (stationId === 'indarc-mooring') return ['POL-ARC-2023-007'];
  if (stationId === 'himansh-station') return ['POL-HIM-2024-004', 'POL-HIM-2024-008'];
  return [];
};

/**
 * Simulate realistic weather readings per region
 */
const generateObservation = (region, status) => {
  if (status === 'HISTORIC') return null;
  const now = new Date().toISOString();
  switch (region) {
    case 'ANTARCTICA': {
      const t = -(Math.floor(Math.random() * 15) + 14);
      const w = Math.floor(Math.random() * 20) + 12;
      const p = Math.floor(Math.random() * 25) + 975;
      return {
        temp: `${t}.2°C`,
        wind: `${w}.4 m/s (SSE)`,
        pressure: `${p}.4 hPa`,
        condition: 'Blizzard Risk',
        updatedAt: '10 mins ago',
        rawTemp: t,
        rawWind: w,
        rawPressure: p
      };
    }
    case 'ARCTIC': {
      const t = -(Math.floor(Math.random() * 10) + 8);
      const w = Math.floor(Math.random() * 15) + 6;
      const p = Math.floor(Math.random() * 20) + 990;
      return {
        temp: `${t}.5°C`,
        wind: `${w}.1 m/s (NW)`,
        pressure: `${p}.0 hPa`,
        condition: 'Polar Night',
        updatedAt: '15 mins ago',
        rawTemp: t,
        rawWind: w,
        rawPressure: p
      };
    }
    case 'HIMALAYA': {
      const t = -(Math.floor(Math.random() * 8) + 2);
      const w = Math.floor(Math.random() * 12) + 5;
      const p = Math.floor(Math.random() * 20) + 625;
      return {
        temp: `${t}.0°C`,
        wind: `${w}.5 m/s (W)`,
        pressure: `${p}.2 hPa`,
        condition: 'Clear',
        updatedAt: '20 mins ago',
        rawTemp: t,
        rawWind: w,
        rawPressure: p
      };
    }
    default: {
      const t = Math.floor(Math.random() * 4) + 1;
      const w = Math.floor(Math.random() * 15) + 8;
      const p = Math.floor(Math.random() * 20) + 1005;
      return {
        temp: `${t}.8°C`,
        wind: `${w}.0 m/s (SW)`,
        pressure: `${p}.0 hPa`,
        condition: 'Survey Active',
        updatedAt: '30 mins ago',
        rawTemp: t,
        rawWind: w,
        rawPressure: p
      };
    }
  }
};

/**
 * 1. Get all stations (with optional region filter)
 */
const getAll = (region) => {
  let stations = getAllStationsFlat();
  if (region) {
    const normalized = region.toLowerCase();
    stations = stations.filter((s) => s.region.toLowerCase() === normalized);
  }
  return stations;
};

/**
 * 2. Get single station by ID (supports 'maitri-station' or 'station-maitri-station')
 */
const getById = (id) => {
  const cleanId = id.replace(/^station-/, '').toLowerCase();
  const stations = getAllStationsFlat();
  const station = stations.find((s) => s.id === cleanId || s.id === id);
  if (!station) {
    const err = new Error(`Station not found: ${id}`);
    err.statusCode = 404;
    throw err;
  }
  return station;
};

module.exports = { getAll, getById, getAllStationsFlat };
