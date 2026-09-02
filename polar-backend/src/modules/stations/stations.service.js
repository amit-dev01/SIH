const { STATION_COORDS } = require('../map/map.service');

// Slug ID overrides — frontend expects these specific IDs
const ID_OVERRIDES = {
  'indarc-mooring-observatory': 'indarc-mooring'
};

// Generate slug IDs from station names (matches frontend expectations)
const slugify = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return ID_OVERRIDES[slug] || slug;
};

// Flatten all stations from all regions into one list with IDs
const getAllStationsFlat = () => {
  const all = [];
  for (const [region, stations] of Object.entries(STATION_COORDS)) {
    stations.forEach((s) => {
      all.push({
        id: slugify(s.name),
        name: s.name,
        region: region.charAt(0) + region.slice(1).toLowerCase(), // e.g. "Antarctica"
        country: 'India',
        agency: 'NCPOR (National Centre for Polar and Ocean Research)',
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
        description: `${s.name} is an Indian polar research base located at ${s.location}, operated by NCPOR under the Ministry of Earth Sciences.`,
        parameters: ['Temperature', 'Wind Speed', 'Atmospheric Pressure', 'Aerosols', 'Humidity'],
        latestObservation: generateObservation(region, s.status),
        // Connected knowledge graph links
        relatedExpeditionIds: getRelatedExpeditionsForStation(slugify(s.name)),
        relatedDatasetIds: getRelatedDatasetsForStation(slugify(s.name)),
        relatedMediaIds: []
      });
    });
  }
  return all;
};

const getRelatedExpeditionsForStation = (stationId) => {
  if (stationId === 'maitri-station' || stationId === 'bharati-station') {
    return ['43rd-indian-scientific-expedition-to-antarctica', '44th-indian-scientific-expedition-to-antarctica'];
  }
  if (stationId === 'himadri-station' || stationId === 'indarc-mooring') {
    return ['indian-arctic-winter-expedition-2024'];
  }
  if (stationId === 'himansh-station') {
    return ['himalayan-cryosphere-survey-chandra-basin'];
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
    case 'ANTARCTICA':
      return {
        temp: -(Math.floor(Math.random() * 20) + 15), // -15 to -35
        wind: Math.floor(Math.random() * 40) + 10,    // 10-50 km/h
        pressure: Math.floor(Math.random() * 30) + 970, // 970-1000 hPa
        condition: 'Blizzard Risk',
        updatedAt: now
      };
    case 'ARCTIC':
      return {
        temp: -(Math.floor(Math.random() * 15) + 5), // -5 to -20
        wind: Math.floor(Math.random() * 30) + 5,    // 5-35 km/h
        pressure: Math.floor(Math.random() * 20) + 990, // 990-1010 hPa
        condition: 'Polar Night',
        updatedAt: now
      };
    case 'HIMALAYA':
      return {
        temp: -(Math.floor(Math.random() * 10) + 2), // -2 to -12
        wind: Math.floor(Math.random() * 25) + 5,    // 5-30 km/h
        pressure: Math.floor(Math.random() * 30) + 620, // 620-650 hPa (high altitude)
        condition: 'Clear',
        updatedAt: now
      };
    default:
      return {
        temp: Math.floor(Math.random() * 5) - 2,
        wind: Math.floor(Math.random() * 20) + 5,
        pressure: Math.floor(Math.random() * 20) + 1000,
        condition: 'Survey Active',
        updatedAt: now
      };
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
 * 2. Get single station by slug ID
 */
const getById = (id) => {
  const stations = getAllStationsFlat();
  const station = stations.find((s) => s.id === id);
  if (!station) {
    const err = new Error(`Station not found: ${id}`);
    err.statusCode = 404;
    throw err;
  }
  return station;
};

module.exports = { getAll, getById, getAllStationsFlat };
