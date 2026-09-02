const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

const KNOWLEDGE_ARTICLES = [
  {
    id: 'understanding-antarctic-sea-ice',
    title: 'Understanding Antarctic Sea-Ice Dynamics and Global Climate Teleconnections',
    category: 'Climate & Cryosphere',
    author: 'Dr. Thamban Meloth, NCPOR',
    publishedDate: '2024-02-15T00:00:00Z',
    readingTime: '8 min read',
    description: 'A comprehensive investigation into the record minimums in Antarctic sea-ice extent and their direct teleconnection with Indian Summer Monsoon variability.',
    tags: ['antarctica', 'sea-ice', 'climate-change', 'monsoon'],
    content: `# Understanding Antarctic Sea-Ice Dynamics and Global Climate Teleconnections\n\n**Author:** Dr. Thamban Meloth, National Centre for Polar and Ocean Research\n\n## Abstract\nRecent satellite microwave observations have revealed unprecedented winter and summer sea-ice loss in the Southern Ocean, particularly in the Weddell and Ross Sea sectors. This article synthesizes four decades of in-situ measurements from India's Maitri and Bharati stations...\n\n## The Role of the Southern Annular Mode (SAM)\nThe Southern Annular Mode (SAM) has exhibited strongly positive phases, enhancing circumpolar westerly winds and driving warm deep water upwelling onto Antarctic continental shelves...\n\n## Impacts on the Indian Summer Monsoon\nCross-equatorial atmospheric waves establish a teleconnection between Southern Ocean heat redistribution and the onset of the Southwest Monsoon over the Indian subcontinent.`,
    relatedDatasetIds: ['POL-ANT-2024-001', 'POL-ANT-2024-005'],
    relatedExpeditionIds: ['43rd-indian-scientific-expedition-to-antarctica']
  },
  {
    id: 'indias-polar-research-programme',
    title: "Four Decades of India's Polar Research Programme: From Dakshin Gangotri to Bharati",
    category: 'Expedition History',
    author: 'Dr. M. Ravichandran, MoES',
    publishedDate: '2024-01-26T00:00:00Z',
    readingTime: '12 min read',
    description: 'The monumental journey of Indian science in the polar regions, chronicling the establishment of Dakshin Gangotri, Maitri, Bharati, Himadri, and Himansh stations.',
    tags: ['history', 'ncpor', 'bharati', 'maitri', 'himadri'],
    content: `# Four Decades of India's Polar Research Programme: From Dakshin Gangotri to Bharati\n\nIndia's Antarctic odyssey commenced in December 1981 under Operation Gangotri. Over the past 40 years, India has emerged as a frontline polar research nation under the Antarctic Treaty System...\n\n## Station Infrastructure\n1. **Dakshin Gangotri (1983):** India's first scientific camp.\n2. **Maitri (1989):** Year-round inland hub in Schirmacher Oasis.\n3. **Bharati (2012):** State-of-the-art modular station in Larsemann Hills.\n4. **Himadri (2008):** High Arctic international station in Svalbard.\n5. **Himansh (2016):** Third Pole high-altitude glaciological observatory.`,
    relatedDatasetIds: ['POL-ANT-2024-001', 'POL-ARC-2024-002', 'POL-HIM-2024-004'],
    relatedExpeditionIds: ['43rd-indian-scientific-expedition-to-antarctica', 'indian-arctic-winter-expedition-2024']
  },
  {
    id: 'black-carbon-arctic-amplification',
    title: 'Black Carbon Transport to the High Arctic and Cryospheric Amplification',
    category: 'Atmospheric Sciences',
    author: 'Dr. K. P. Krishnan, NCPOR',
    publishedDate: '2024-03-05T00:00:00Z',
    readingTime: '6 min read',
    description: 'Long-range airborne black carbon pollution transport pathways into Ny-Ålesund, Svalbard, and its accelerating impact on polar snow albedo feedback.',
    tags: ['arctic', 'himadri', 'aerosols', 'black-carbon'],
    content: `# Black Carbon Transport to the High Arctic and Cryospheric Amplification\n\nBlack carbon (BC) particles emitted from industrial combustion and wildfires at lower latitudes are transported across the circumpolar vortex into the High Arctic...\n\nObservations from the Gruvebadet Atmospheric Laboratory and Himadri Station indicate substantial seasonal pulses during Arctic Haze episodes, darkening the snow cover and hastening springtime ablation.`,
    relatedDatasetIds: ['POL-ARC-2024-002', 'POL-ARC-2023-007'],
    relatedExpeditionIds: ['indian-arctic-winter-expedition-2024']
  },
  {
    id: 'climate-change-himalayan-cryosphere',
    title: 'Himalayan Cryosphere under a Warming Climate: Observations from Himansh',
    category: 'Glaciology',
    author: 'Dr. Parmanand Sharma, NCPOR',
    publishedDate: '2024-04-10T00:00:00Z',
    readingTime: '9 min read',
    description: 'Decadal glaciological mass balance and ice velocity tracking from Chandra Basin benchmark glaciers in Himachal Pradesh.',
    tags: ['himalayas', 'himansh', 'glaciers', 'water-security'],
    content: `# Himalayan Cryosphere under a Warming Climate: Observations from Himansh\n\nThe Hindu Kush Himalayas, known as Earth's Third Pole, store the largest volume of ice outside the polar regions. Data collected from the Himansh Observatory at 4,080m reveals persistent negative mass balances across Chandra basin glaciers...\n\nContinuous discharge monitoring indicates elevated meltwater runoff in early summer followed by reduced late-season flow, posing challenges for river basin water management.`,
    relatedDatasetIds: ['POL-HIM-2024-004', 'POL-HIM-2024-008'],
    relatedExpeditionIds: ['himalayan-cryosphere-survey-chandra-basin']
  },
  {
    id: 'oceanographic-research-southern-ocean',
    title: 'Biogeochemical Cycles and Carbon Sequestration in the Southern Ocean',
    category: 'Oceanography',
    author: 'Dr. N. Anilkumar, NCPOR',
    publishedDate: '2023-11-18T00:00:00Z',
    readingTime: '10 min read',
    description: 'Quantifying the Southern Ocean biological carbon pump and Southern Annular Mode-driven iron fertilization mechanisms.',
    tags: ['southern-ocean', 'carbon-sink', 'oceanography'],
    content: `# Biogeochemical Cycles and Carbon Sequestration in the Southern Ocean\n\nThe Southern Ocean accounts for nearly 40% of the anthropogenic carbon dioxide absorbed by the global oceans. Scientific cruises under the Indian Southern Ocean Expedition have mapped nutrient limitation and phytoplankton blooms across the Polar Front.`,
    relatedDatasetIds: ['POL-SO-2023-003', 'POL-ANT-2024-006'],
    relatedExpeditionIds: ['43rd-indian-scientific-expedition-to-antarctica']
  }
];

const getAll = async (query = {}) => {
  const { category, tag, q } = query;
  let articles = [...KNOWLEDGE_ARTICLES];

  // Try to blend any publications in Supabase
  try {
    const { data: pubs } = await supabase.from('publications').select('*');
    if (pubs && pubs.length > 0) {
      pubs.forEach((p) => {
        if (!articles.some((a) => a.id === p.id)) {
          articles.push({
            id: p.id,
            title: p.title,
            category: p.journal || 'Peer-Reviewed Research',
            author: Array.isArray(p.authors) ? p.authors.join(', ') : p.authors || 'NCPOR Scientists',
            publishedDate: p.published_date || new Date().toISOString(),
            readingTime: '7 min read',
            description: p.abstract || p.title,
            tags: ['research', 'ncpor'],
            content: `# ${p.title}\n\n## Abstract\n${p.abstract || 'Scientific research paper published under NCPOR polar programmes.'}\n\n**DOI:** ${p.doi || 'N/A'}\n**Journal:** ${p.journal || 'Polar Science'}`,
            relatedDatasetIds: ['POL-ANT-2024-001'],
            relatedExpeditionIds: []
          });
        }
      });
    }
  } catch (err) {
    logger.warn(`Knowledge Supabase load notice: ${err.message}`);
  }

  if (category) {
    articles = articles.filter((a) => a.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (tag) {
    articles = articles.filter((a) => a.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  }

  if (q) {
    const s = q.toLowerCase();
    articles = articles.filter((a) => a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s));
  }

  return articles;
};

const getById = async (id) => {
  const found = KNOWLEDGE_ARTICLES.find((a) => a.id === id);
  if (found) {
    return found;
  }

  // Check Supabase
  const { data: pub } = await supabase.from('publications').select('*').eq('id', id).maybeSingle();
  if (pub) {
    return {
      id: pub.id,
      title: pub.title,
      category: pub.journal || 'Peer-Reviewed Research',
      author: Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || 'NCPOR Scientists',
      publishedDate: pub.published_date || new Date().toISOString(),
      readingTime: '7 min read',
      description: pub.abstract || pub.title,
      tags: ['research', 'ncpor'],
      content: `# ${pub.title}\n\n## Abstract\n${pub.abstract || 'Scientific research paper published under NCPOR polar programmes.'}\n\n**DOI:** ${pub.doi || 'N/A'}\n**Journal:** ${pub.journal || 'Polar Science'}`,
      relatedDatasetIds: ['POL-ANT-2024-001'],
      relatedExpeditionIds: []
    };
  }

  const err = new Error(`Knowledge article not found: ${id}`);
  err.statusCode = 404;
  throw err;
};

module.exports = {
  getAll,
  getById,
  KNOWLEDGE_ARTICLES
};
