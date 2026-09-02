const GLOSSARY_TERMS = [
  {
    id: 'term-albedo',
    term: 'Albedo',
    category: 'Cryospheric Physics',
    simple_definition: 'How well a surface reflects sunlight. Fresh white snow has high albedo (reflects up to 90% of heat), while dark open ocean has low albedo (absorbs heat).',
    scientific_definition: 'The non-dimensional measure of diffuse reflectivity of solar radiation out of the total incident solar irradiance across the planetary surface.',
    related_dataset_ids: ['POL-ANT-2024-001', 'POL-ARC-2024-002']
  },
  {
    id: 'term-katabatic-winds',
    term: 'Katabatic Winds',
    category: 'Polar Meteorology',
    simple_definition: 'Extremely fierce, cold winds that rush down high Antarctic ice slopes toward the coast under the pull of gravity, often exceeding 100 km/h.',
    scientific_definition: 'Gravity-driven downslope drainage flows of dense, radiatively cooled boundary-layer air originating over the high Antarctic plateau.',
    related_dataset_ids: ['POL-ANT-2024-001']
  },
  {
    id: 'term-polynya',
    term: 'Polynya',
    category: 'Oceanography & Sea Ice',
    simple_definition: 'An open patch of water in the middle of frozen sea ice where sea animals like penguins and seals can surface to breathe.',
    scientific_definition: 'Non-linear open water regions within sea ice pack sustained either by sensible heat upwelling or latent heat divergence driven by offshore winds.',
    related_dataset_ids: ['POL-ANT-2024-006']
  },
  {
    id: 'term-ice-shelf',
    term: 'Ice Shelf',
    category: 'Glaciology',
    simple_definition: 'A massive floating slab of permanent ice that extends from land over the ocean. When they break off, they form giant tabular icebergs.',
    scientific_definition: 'A thick, buoyant platform of meteoric ice fed by grounding tributary glaciers that extends into a marine or lacustrine embayment.',
    related_dataset_ids: ['POL-ANT-2024-005']
  },
  {
    id: 'term-black-carbon',
    term: 'Black Carbon',
    category: 'Atmospheric Sciences',
    simple_definition: 'Dark soot particles released from fires and vehicle exhaust that drift across the air to the Arctic and darken snow, causing it to melt faster.',
    scientific_definition: 'A primary component of fine particulate matter (PM2.5) consisting of pure carbon formed through incomplete combustion of fossil fuels, biofuels, and biomass.',
    related_dataset_ids: ['POL-ARC-2024-002']
  },
  {
    id: 'term-subduction',
    term: 'Antarctic Bottom Water (AABW) Subduction',
    category: 'Ocean Circulation',
    simple_definition: 'The process where surface water in Antarctica gets super cold and salty, sinks to the deep ocean floor, and powers global ocean currents.',
    scientific_definition: 'Densification and deep sinking of hypersaline shelf brine driving the lower limb of the Atlantic Meridional Overturning Circulation (AMOC).',
    related_dataset_ids: ['POL-SO-2023-003']
  }
];

const getAll = (query = {}) => {
  const { category, search, q } = query;
  let list = [...GLOSSARY_TERMS];

  if (category) {
    list = list.filter((t) => t.category.toLowerCase().includes(category.toLowerCase()));
  }

  const s = (search || q || '').toLowerCase();
  if (s) {
    list = list.filter(
      (t) =>
        t.term.toLowerCase().includes(s) ||
        t.simple_definition.toLowerCase().includes(s) ||
        t.scientific_definition.toLowerCase().includes(s)
    );
  }

  return list;
};

const getById = (id) => {
  const item = GLOSSARY_TERMS.find((t) => t.id === id || t.term.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase());
  if (!item) {
    const err = new Error(`Glossary term not found: ${id}`);
    err.statusCode = 404;
    throw err;
  }
  return item;
};

module.exports = {
  getAll,
  getById,
  GLOSSARY_TERMS
};
