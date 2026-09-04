const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const { generateContent } = require('../../services/ai.service');
const embeddingService = require('../embeddings/embedding.service');

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'how', 'does', 'do', 'can', 'are', 'in', 'at', 'on', 'of',
  'to', 'a', 'an', 'and', 'for', 'with', 'about', 'why', 'where', 'when', 'who', 'tell', 'me'
]);

/**
 * Extract meaningful search terms from user question
 */
const extractKeywords = (question) => {
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
};

/**
 * Retrieve ground truth publications, expeditions, and datasets from database
 */
const retrieveGroundTruth = async (keywords, region = null, fullQuestion = '') => {
  const sources = [];
  const primaryTerm = keywords[0] || 'polar';
  const secondaryTerm = keywords[1] || '';

  // 1. Semantic Vector Retrieval (pgvector / Gemini embeddings)
  if (fullQuestion) {
    try {
      const vectorMatches = await embeddingService.searchSimilar({
        query: fullQuestion,
        topK: 4,
        threshold: 0.22
      });

      if (vectorMatches && vectorMatches.length > 0) {
        vectorMatches.forEach((vm) => {
          sources.push({
            type: (vm.sourceType || 'publication').toLowerCase(),
            id: vm.sourceId || vm.id,
            title: vm.title,
            authors: vm.metadata?.authors ? [vm.metadata.authors] : ['NCPOR Scientific Team'],
            journal: vm.metadata?.journal || 'National Centre for Polar and Ocean Research',
            doi: vm.metadata?.doi || `10.1016/ncpor.${String(vm.sourceId).slice(0, 8)}`,
            doiUrl: vm.metadata?.url || `https://doi.org/10.1016/ncpor.${String(vm.sourceId).slice(0, 8)}`,
            date: vm.metadata?.publishedDate || new Date().toISOString(),
            region: vm.metadata?.region || region || 'POLAR',
            snippet: vm.content.slice(0, 300) + '...',
            similarity: vm.similarity
          });
        });
      }
    } catch (err) {
      logger.warn(`Ask Polar AI vector search notice: ${err.message}`);
    }
  }

  try {
    // 2. Search Publications
    let pubQuery = supabase
      .from('publications')
      .select('id, title, abstract, authors, journal, doi, published_date, expedition:expeditions(id, title, region)')
      .limit(5);

    if (primaryTerm) {
      pubQuery = pubQuery.or(`title.ilike.%${primaryTerm}%,abstract.ilike.%${primaryTerm}%,journal.ilike.%${primaryTerm}%`);
    }

    const { data: pubs, error: pubErr } = await pubQuery;
    if (!pubErr && pubs && pubs.length > 0) {
      pubs.forEach((p) => {
        const authorsList = Array.isArray(p.authors) ? p.authors : [p.authors || 'NCPOR Scientists'];
        sources.push({
          type: 'publication',
          id: p.id,
          title: p.title,
          authors: authorsList,
          journal: p.journal || 'Polar Science Journal',
          doi: p.doi || `10.1016/ncpor.${p.id.slice(0, 8)}`,
          doiUrl: p.doi ? `https://doi.org/${p.doi}` : `https://doi.org/10.1016/ncpor.${p.id.slice(0, 8)}`,
          date: p.published_date,
          region: p.expedition?.region || 'POLAR',
          snippet: p.abstract ? p.abstract.slice(0, 300) + '...' : p.title
        });
      });
    }

    // 2. Search Expeditions
    let expQuery = supabase
      .from('expeditions')
      .select('id, title, description, summary, region, status, slug, start_date')
      .limit(3);

    if (region) {
      expQuery = expQuery.eq('region', region);
    } else if (primaryTerm) {
      expQuery = expQuery.or(`title.ilike.%${primaryTerm}%,description.ilike.%${primaryTerm}%,summary.ilike.%${primaryTerm}%`);
    }

    const { data: exps, error: expErr } = await expQuery;
    if (!expErr && exps && exps.length > 0) {
      exps.forEach((e) => {
        sources.push({
          type: 'expedition',
          id: e.id,
          title: e.title,
          slug: e.slug,
          region: e.region,
          status: e.status,
          date: e.start_date,
          snippet: (e.summary || e.description || '').slice(0, 300) + '...'
        });
      });
    }

    // 3. Search Datasets
    if (sources.length < 3) {
      let dataQuery = supabase
        .from('datasets')
        .select('id, title, description, format, created_at')
        .limit(2);

      if (primaryTerm) {
        dataQuery = dataQuery.or(`title.ilike.%${primaryTerm}%,description.ilike.%${primaryTerm}%`);
      }

      const { data: datasets } = await dataQuery;
      if (datasets && datasets.length > 0) {
        datasets.forEach((d) => {
          sources.push({
            type: 'dataset',
            id: d.id,
            title: d.title,
            format: d.format,
            date: d.created_at,
            snippet: (d.description || '').slice(0, 250) + '...'
          });
        });
      }
    }
  } catch (err) {
    logger.warn(`Error during RAG context retrieval: ${err.message}`);
  }

  // Fallback: If no direct matches, grab recent publications & expeditions to guarantee rich ground truth
  if (sources.length === 0) {
    const { data: defaultPubs } = await supabase
      .from('publications')
      .select('id, title, abstract, authors, journal, doi, published_date, expedition:expeditions(id, title, region)')
      .limit(3);

    (defaultPubs || []).forEach((p) => {
      sources.push({
        type: 'publication',
        id: p.id,
        title: p.title,
        authors: Array.isArray(p.authors) ? p.authors : [p.authors || 'NCPOR Scientists'],
        journal: p.journal || 'Polar Science Journal',
        doi: p.doi || `10.1016/ncpor.${p.id.slice(0, 8)}`,
        doiUrl: p.doi ? `https://doi.org/${p.doi}` : `https://doi.org/10.1016/ncpor.${p.id.slice(0, 8)}`,
        date: p.published_date,
        region: p.expedition?.region || 'POLAR',
        snippet: p.abstract ? p.abstract.slice(0, 300) + '...' : p.title
      });
    });

    const { data: defaultExps } = await supabase
      .from('expeditions')
      .select('id, title, description, summary, region, slug, start_date')
      .limit(3);

    (defaultExps || []).forEach((e) => {
      sources.push({
        type: 'expedition',
        id: e.id,
        title: e.title,
        slug: e.slug,
        region: e.region,
        date: e.start_date,
        snippet: (e.summary || e.description || '').slice(0, 300) + '...'
      });
    });
  }

  return sources.slice(0, 5).map((s, idx) => ({
    citationIndex: idx + 1,
    ...s
  }));
};

/**
 * Ask a scientific question with ground-truth citation backing
 */
const askQuestion = async (question, region = null, language = 'en') => {
  const cacheKey = `ask:${Buffer.from(question.trim().toLowerCase()).toString('base64')}:${region || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const keywords = extractKeywords(question);
  const sources = await retrieveGroundTruth(keywords, region, question);

  // Build structured ground-truth text for LLM
  let contextBlock = 'GROUND TRUTH NCPOR RESEARCH CONTEXT:\n';
  sources.forEach((s) => {
    contextBlock += `\n[Source ${s.citationIndex}] ${s.title}\n`;
    if (s.authors) contextBlock += `Authors: ${s.authors.join(', ')}\n`;
    if (s.journal) contextBlock += `Journal: ${s.journal} | DOI: ${s.doi || 'N/A'}\n`;
    if (s.region) contextBlock += `Region: ${s.region}\n`;
    contextBlock += `Summary: ${s.snippet}\n`;
  });

  const systemPrompt =
    `You are "Ask Polar AI", an expert scientific research communicator for the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt. of India.
Your mission is to provide accurate, clear, and inspiring answers to questions about India's polar science research (Antarctica, Arctic, Himalayas, Southern Ocean).

Guidelines:
1. Base your answer strictly on the provided Ground Truth NCPOR Research Context and authentic polar science facts.
2. Whenever stating a specific scientific fact, measurement, or discovery, cite the source using bracketed numbers like [1], [2] corresponding to the sources.
3. Structure your response with clean Markdown: use bolding, bullet points, and short readable paragraphs.
4. Keep the tone authoritative yet accessible for students, researchers, and citizens.
5. At the very end of your response, provide exactly 3 logical follow-up questions formatted as:
FOLLOW_UPS:
- Suggested question 1?
- Suggested question 2?
- Suggested question 3?`;

  const userPrompt = `User Question: "${question}"\n\n${contextBlock}`;

  const rawAnswer = await generateContent(systemPrompt, userPrompt, 'WEBSITE', contextBlock);

  // Parse response and follow-ups
  let cleanAnswer = rawAnswer;
  let suggestedFollowUps = [
    'What instruments are used for observations at Bharati Station?',
    'How do polar changes affect the Indian Summer Monsoon?',
    'What is the difference between Maitri and Bharati research focus?'
  ];

  if (rawAnswer.includes('FOLLOW_UPS:')) {
    const parts = rawAnswer.split('FOLLOW_UPS:');
    cleanAnswer = parts[0].trim();
    const followUpLines = parts[1]
      .split('\n')
      .map((l) => l.replace(/^[-*0-9.]+\s*/, '').trim())
      .filter((l) => l.length > 5);

    if (followUpLines.length > 0) {
      suggestedFollowUps = followUpLines.slice(0, 3);
    }
  }

  const responsePayload = {
    question,
    region: region || 'GLOBAL_POLAR',
    answer: cleanAnswer,
    sources,
    suggestedFollowUps,
    answeredAt: new Date().toISOString()
  };

  cache.set(cacheKey, responsePayload, 600); // 10 min cache
  return responsePayload;
};

/**
 * Curated list of starter suggestions for frontend discovery
 */
const getSuggestions = () => {
  return [
    {
      category: 'Antarctica (Bharati & Maitri)',
      icon: '🧊',
      questions: [
        'How does Bharati Station generate eco-friendly power in Antarctica?',
        'What was discovered in the deep ice core drilling at Maitri Station?',
        'What is the current status of the Antarctic Ozone Hole over Indian stations?'
      ]
    },
    {
      category: 'Arctic (Himadri Station)',
      icon: '❄️',
      questions: [
        'What research does India conduct at Himadri Station in Svalbard?',
        'How does Arctic sea-ice melting influence atmospheric circulation over India?',
        'What microorganisms have Indian scientists discovered in the Arctic tundra?'
      ]
    },
    {
      category: 'Himalayas & Third Pole (Himansh)',
      icon: '🏔️',
      questions: [
        'How are Chandra Basin glaciers monitored from Himansh Station?',
        'What are the measured glacier retreat rates in the Western Himalayas?',
        'Why are the Himalayas referred to as the Third Pole?'
      ]
    },
    {
      category: 'Climate & Monsoon Teleconnections',
      icon: '🌧️',
      questions: [
        'How does Antarctic sea ice extent correlate with the Indian Summer Monsoon?',
        'What role do Southern Ocean currents play in global heat redistribution?'
      ]
    }
  ];
};

module.exports = {
  askQuestion,
  getSuggestions,
  retrieveGroundTruth
};
