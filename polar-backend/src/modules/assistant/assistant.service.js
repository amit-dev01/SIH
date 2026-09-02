const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const { generateContent } = require('../../services/ai.service');
const stationsService = require('../stations/stations.service');

// Curated scientific baseline data matching frontend catalog IDs
const BASELINE_DATASETS = [
  {
    id: 'POL-ANT-2024-001',
    title: 'Bharati Station Surface Meteorology & Radiative Flux',
    type: 'dataset',
    region: 'Antarctica',
    discipline: 'Atmospheric Sciences',
    station: 'Bharati Station',
    description: 'High-frequency automatic weather station (AWS) measurements including incoming shortwave/longwave radiation, wind profile, and temperature flux from coastal Larsemann Hills.',
    url: '/datasets/POL-ANT-2024-001'
  },
  {
    id: 'POL-ARC-2024-002',
    title: 'Ny-Ålesund Black Carbon & Aerosol Optical Depth (AOD)',
    type: 'dataset',
    region: 'Arctic',
    discipline: 'Atmospheric Sciences',
    station: 'Himadri Station',
    description: 'Continuous multi-wavelength aethalometer and sun photometer observations from Himadri station and Gruvebadet atmospheric laboratory in Svalbard.',
    url: '/datasets/POL-ARC-2024-002'
  },
  {
    id: 'POL-SO-2023-003',
    title: 'Southern Ocean Hydrographic CTD Transect & Salinity Profile',
    type: 'dataset',
    region: 'Southern Ocean',
    discipline: 'Oceanography',
    station: 'Southern Ocean Survey',
    description: 'Deep ocean CTD casts measuring temperature, salinity, dissolved oxygen, and chlorophyll-a across the Sub-Antarctic and Polar Front zones.',
    url: '/datasets/POL-SO-2023-003'
  },
  {
    id: 'POL-HIM-2024-004',
    title: 'Chandra Basin High-Altitude Glacier Mass Balance & Runoff',
    type: 'dataset',
    region: 'Himalayas',
    discipline: 'Glaciology & Cryosphere',
    station: 'Himansh Station',
    description: 'Glacier ablation stakes, dGPS ice elevation mapping, and automated discharge gauging from Sutri Dhaka and Batal glaciers in the Western Himalayas.',
    url: '/datasets/POL-HIM-2024-004'
  },
  {
    id: 'POL-ANT-2024-005',
    title: 'Maitri Station Deep Ice Core Stable Isotope Analysis (δ18O & δD)',
    type: 'dataset',
    region: 'Antarctica',
    discipline: 'Glaciology & Cryosphere',
    station: 'Maitri Station',
    description: 'High-resolution stable water isotope records from Schirmacher Oasis firn cores reconstructing past 500 years of climate teleconnections with the Indian Monsoon.',
    url: '/datasets/POL-ANT-2024-005'
  }
];

const BASELINE_KNOWLEDGE = [
  {
    id: 'understanding-antarctic-sea-ice',
    title: 'Understanding Antarctic Sea-Ice Dynamics and Global Climate Teleconnections',
    type: 'knowledge',
    description: 'A comprehensive review of multi-decadal satellite microwave radiometry and in-situ observations documenting recent record lows in Antarctic sea ice extent.',
    url: '/knowledge/understanding-antarctic-sea-ice'
  },
  {
    id: 'indias-polar-research-programme',
    title: "Four Decades of India's Polar Research Programme: From Dakshin Gangotri to Bharati",
    type: 'knowledge',
    description: 'The historical evolution of India in Antarctica, the establishment of Maitri and Bharati stations, and future directions with Polar Research Vessel (PRV).',
    url: '/knowledge/indias-polar-research-programme'
  },
  {
    id: 'black-carbon-arctic-amplification',
    title: 'Black Carbon Transport to the High Arctic and Cryospheric Amplification',
    type: 'knowledge',
    description: 'Long-range transport of atmospheric aerosols into Ny-Ålesund, Svalbard, and their role in lowering ice albedo and accelerating summer melt.',
    url: '/knowledge/black-carbon-arctic-amplification'
  },
  {
    id: 'climate-change-himalayan-cryosphere',
    title: 'Himalayan Cryosphere under a Warming Climate: Observations from Himansh',
    type: 'knowledge',
    description: 'Mass budget assessment of Chandra basin glaciers indicating accelerated retreat rates and implications for downstream water security in the Indus basin.',
    url: '/knowledge/climate-change-himalayan-cryosphere'
  }
];

/**
 * Retrieve matching scientific sources across Supabase + curated catalogue
 */
const findRelevantSources = async (question, context = null) => {
  const sources = [];
  const qLower = question.toLowerCase();

  // 1. If context is provided, prioritize it as Source #1
  if (context && context.id) {
    const contextType = context.type || 'dataset';
    let url = `/${contextType}s/${context.id}`;
    if (contextType === 'knowledge') url = `/knowledge/${context.id}`;
    if (contextType === 'station') url = `/map?station=${context.id}`;

    sources.push({
      id: context.id,
      type: contextType,
      title: context.title || context.id,
      description: `Active viewing context: ${context.title || context.id}`,
      url
    });
  }

  // 2. Match Baseline Datasets
  for (const ds of BASELINE_DATASETS) {
    if (
      qLower.includes(ds.region.toLowerCase()) ||
      qLower.includes(ds.station.toLowerCase().split(' ')[0]) ||
      qLower.includes(ds.discipline.toLowerCase().split(' ')[0]) ||
      qLower.includes('dataset') ||
      qLower.includes('data') ||
      ds.title.toLowerCase().split(' ').some((w) => w.length > 4 && qLower.includes(w))
    ) {
      if (!sources.some((s) => s.id === ds.id)) {
        sources.push({
          id: ds.id,
          type: 'dataset',
          title: ds.title,
          description: ds.description,
          url: ds.url
        });
      }
    }
  }

  // 3. Match Baseline Knowledge
  for (const kn of BASELINE_KNOWLEDGE) {
    if (
      kn.title.toLowerCase().split(' ').some((w) => w.length > 4 && qLower.includes(w)) ||
      qLower.includes('research') ||
      qLower.includes('paper') ||
      qLower.includes('study')
    ) {
      if (!sources.some((s) => s.id === kn.id)) {
        sources.push({
          id: kn.id,
          type: 'knowledge',
          title: kn.title,
          description: kn.description,
          url: kn.url
        });
      }
    }
  }

  // 4. Match Stations
  const stations = stationsService.getAllStationsFlat();
  for (const st of stations) {
    const stNamePart = st.name.toLowerCase().split(' ')[0];
    if (qLower.includes(stNamePart) || qLower.includes(st.id)) {
      if (!sources.some((s) => s.id === st.id)) {
        sources.push({
          id: st.id,
          type: 'station',
          title: st.name,
          description: `${st.name} (${st.region}) — ${st.location}. Status: ${st.status}`,
          url: `/map?station=${st.id}`
        });
      }
    }
  }

  // 5. Query Supabase for dynamic publications/expeditions
  try {
    const firstWord = qLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).find((w) => w.length > 3) || 'polar';
    const { data: pubs } = await supabase
      .from('publications')
      .select('id, title, abstract')
      .or(`title.ilike.%${firstWord}%,abstract.ilike.%${firstWord}%`)
      .limit(2);

    if (pubs && pubs.length > 0) {
      pubs.forEach((p) => {
        if (!sources.some((s) => s.id === p.id)) {
          sources.push({
            id: p.id,
            type: 'knowledge',
            title: p.title,
            description: p.abstract ? p.abstract.slice(0, 200) + '...' : p.title,
            url: `/knowledge/${p.id}`
          });
        }
      });
    }
  } catch (err) {
    logger.warn(`Assistant DB query notice: ${err.message}`);
  }

  // Guarantee at least 1-3 highly relevant sources
  if (sources.length === 0) {
    sources.push(BASELINE_DATASETS[0]);
    sources.push(BASELINE_KNOWLEDGE[0]);
  }

  return sources.slice(0, 4);
};

/**
 * Handle scientific question with RAG & conversation memory
 */
const askAssistant = async ({ question, context = null, messages = [] }) => {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    const err = new Error('Question is required');
    err.statusCode = 400;
    throw err;
  }

  const cleanQuestion = question.trim();
  const cacheKey = `assistant:${Buffer.from(cleanQuestion.toLowerCase()).toString('base64')}:${context?.id || 'none'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Retrieve ground-truth sources
  const sources = await findRelevantSources(cleanQuestion, context);

  // 2. Build ground truth text
  let contextBlock = 'GROUND TRUTH NCPOR SCIENTIFIC CONTEXT:\n';
  sources.forEach((s, idx) => {
    contextBlock += `[Source ${idx + 1}] (${s.type.toUpperCase()}): ${s.title}\nDescription: ${s.description}\nLink: ${s.url}\n\n`;
  });

  // 3. Format message history (up to last 4 turns)
  let historyBlock = '';
  if (Array.isArray(messages) && messages.length > 0) {
    historyBlock = 'RECENT CONVERSATION HISTORY:\n';
    messages.slice(-4).forEach((m) => {
      historyBlock += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n`;
    });
    historyBlock += '\n';
  }

  const systemPrompt = `You are POLARIS AI, the expert scientific research assistant for India's National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Government of India.
Your mission is to provide accurate, clear, and inspiring answers to researchers, students, and citizens regarding India's polar and ocean programmes (Antarctica: Bharati, Maitri; Arctic: Himadri, IndARC; Himalayas: Himansh; Southern Ocean).

GUIDELINES:
1. Base your answers on the provided Ground Truth NCPOR Scientific Context and verified polar scientific knowledge.
2. Structure your answer using clear Markdown: bold headings, short digestible paragraphs, bullet points, and quantitative metrics where relevant.
3. If discussing research stations, datasets, or expeditions, naturally reference the relevant sources (e.g. "According to data collected at Bharati Station...").
4. Maintain a professional, scientifically authoritative, yet enthusiastic tone suitable for both PhD researchers and university students.
5. Do NOT output meta prefixes like "ANSWER:" or "ASSISTANT:". Output the formatted scientific markdown directly.`;

  const userPrompt = `${historyBlock}${contextBlock}CURRENT USER QUESTION:
"${cleanQuestion}"`;

  // 4. Generate response via AI engine (Groq/Gemini with auto-failover)
  const rawAnswer = await generateContent(systemPrompt, userPrompt, 'WEBSITE', contextBlock);

  // Clean answer
  const answer = rawAnswer.replace(/^POLARIS AI:\s*/i, '').trim();

  const responsePayload = {
    answer,
    sources,
    // Provide both root fields and data wrapper so frontend can consume either
    success: true,
    data: {
      answer,
      sources
    }
  };

  cache.set(cacheKey, responsePayload, 300); // 5 min cache
  return responsePayload;
};

module.exports = {
  askAssistant,
  findRelevantSources,
  BASELINE_DATASETS,
  BASELINE_KNOWLEDGE
};
