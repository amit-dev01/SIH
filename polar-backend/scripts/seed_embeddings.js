const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const embeddingService = require('../src/modules/embeddings/embedding.service');
const { CATALOG_DATASETS } = require('../src/modules/dataset/dataset.catalog');
const { KNOWLEDGE_ARTICLES } = require('../src/modules/knowledge/knowledge.service');
const stationsService = require('../src/modules/stations/stations.service');
const { GLOSSARY_TERMS } = require('../src/modules/glossary/glossary.service');
const supabase = require('../src/config/supabase');
const logger = require('../src/utils/logger');

/**
 * Master function to seed all scientific domain documents into the vector index
 */
const seedAllEmbeddings = async () => {
  logger.info('=== Starting POLARIS Scientific Vector Embedding Pipeline ===');
  let indexedCount = 0;

  // 1. Index Catalog Datasets
  logger.info(`Vectorizing ${CATALOG_DATASETS.length} Catalog Datasets...`);
  for (const ds of CATALOG_DATASETS) {
    try {
      const vars = ds.variables ? ds.variables.map((v) => `${v.name} (${v.unit || ''}): ${v.description || ''}`).join('; ') : '';
      const content = `${ds.fullDescription || ds.shortDescription || ''}\nVariables: ${vars}\nStation: ${ds.station}\nDiscipline: ${ds.discipline}\nRegion: ${ds.region}`;

      await embeddingService.upsertDocument({
        id: `dataset:${ds.id}`,
        sourceType: 'DATASET',
        sourceId: ds.id,
        title: ds.title,
        content,
        metadata: {
          id: ds.id,
          type: 'dataset',
          region: ds.region,
          discipline: ds.discipline,
          station: ds.station,
          format: ds.dataFormat || ds.format,
          url: `/datasets/${ds.id}`
        }
      });
      indexedCount++;
      logger.info(`[Dataset] Embedded: ${ds.title} (${ds.id})`);
    } catch (err) {
      logger.error(`Error embedding dataset ${ds.id}: ${err.message}`);
    }
  }

  // 2. Index Knowledge Articles
  logger.info(`Vectorizing ${KNOWLEDGE_ARTICLES.length} Knowledge Articles...`);
  for (const ka of KNOWLEDGE_ARTICLES) {
    try {
      const content = `${ka.description}\n\n${ka.content || ''}\nAuthor: ${ka.author || 'NCPOR'}\nCategory: ${ka.category}`;
      await embeddingService.upsertDocument({
        id: `knowledge:${ka.id}`,
        sourceType: 'KNOWLEDGE',
        sourceId: ka.id,
        title: ka.title,
        content,
        metadata: {
          id: ka.id,
          type: 'knowledge',
          author: ka.author,
          category: ka.category,
          tags: ka.tags,
          url: `/knowledge/${ka.id}`
        }
      });
      indexedCount++;
      logger.info(`[Knowledge] Embedded: ${ka.title}`);
    } catch (err) {
      logger.error(`Error embedding article ${ka.id}: ${err.message}`);
    }
  }

  // 3. Index Research Stations
  const stations = stationsService.getAllStationsFlat();
  logger.info(`Vectorizing ${stations.length} Polar Stations...`);
  for (const st of stations) {
    try {
      const content = `${st.description}\nLocation: ${st.location}, Elevation: ${st.elevation}, Established: ${st.established}. Parameters measured: ${(st.parameters || []).join(', ')}. Current status: ${st.status}.`;
      await embeddingService.upsertDocument({
        id: `station:${st.id}`,
        sourceType: 'STATION',
        sourceId: st.id,
        title: st.name,
        content,
        metadata: {
          id: st.id,
          type: 'station',
          region: st.region,
          location: st.location,
          status: st.status,
          url: `/map?station=${st.id}`
        }
      });
      indexedCount++;
      logger.info(`[Station] Embedded: ${st.name}`);
    } catch (err) {
      logger.error(`Error embedding station ${st.id}: ${err.message}`);
    }
  }

  // 4. Index Glossary Terms
  logger.info(`Vectorizing ${GLOSSARY_TERMS.length} Glossary Terms...`);
  for (const term of GLOSSARY_TERMS) {
    try {
      const content = `Simple Definition: ${term.simple_definition}\nScientific Definition: ${term.scientific_definition}\nCategory: ${term.category}`;
      await embeddingService.upsertDocument({
        id: `glossary:${term.id}`,
        sourceType: 'GLOSSARY',
        sourceId: term.id,
        title: term.term,
        content,
        metadata: {
          id: term.id,
          type: 'glossary',
          category: term.category,
          simple: term.simple_definition,
          scientific: term.scientific_definition,
          url: `/glossary`
        }
      });
      indexedCount++;
      logger.info(`[Glossary] Embedded: ${term.term}`);
    } catch (err) {
      logger.error(`Error embedding glossary term ${term.id}: ${err.message}`);
    }
  }

  // 5. Index Supabase Publications (if reachable)
  try {
    const { data: pubs, error: pubErr } = await supabase.from('publications').select('*').limit(50);
    if (!pubErr && pubs && pubs.length > 0) {
      logger.info(`Vectorizing ${pubs.length} Supabase Scientific Publications...`);
      for (const pub of pubs) {
        try {
          const authors = Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || '';
          const content = `Title: ${pub.title}\nAbstract: ${pub.abstract || 'Scientific paper.'}\nAuthors: ${authors}\nJournal: ${pub.journal || 'Polar Sciences'}\nDOI: ${pub.doi || 'N/A'}`;
          await embeddingService.upsertDocument({
            id: `publication:${pub.id}`,
            sourceType: 'PUBLICATION',
            sourceId: pub.id,
            title: pub.title,
            content,
            metadata: {
              id: pub.id,
              type: 'publication',
              authors,
              journal: pub.journal,
              doi: pub.doi,
              url: `/knowledge/${pub.id}`
            }
          });
          indexedCount++;
          logger.info(`[Publication] Embedded: ${pub.title}`);
        } catch (e) {
          logger.warn(`Error embedding pub ${pub.id}: ${e.message}`);
        }
      }
    }
  } catch (err) {
    logger.debug(`Supabase publications fetch skipped: ${err.message}`);
  }

  // 6. Index Supabase Expeditions (if reachable)
  try {
    const { data: exps, error: expErr } = await supabase.from('expeditions').select('*').limit(20);
    if (!expErr && exps && exps.length > 0) {
      logger.info(`Vectorizing ${exps.length} Supabase Expeditions...`);
      for (const exp of exps) {
        try {
          const content = `${exp.title}\n${exp.summary || ''}\n${exp.description || ''}\nRegion: ${exp.region}\nStatus: ${exp.status}`;
          await embeddingService.upsertDocument({
            id: `expedition:${exp.id}`,
            sourceType: 'EXPEDITION',
            sourceId: exp.id,
            title: exp.title,
            content,
            metadata: {
              id: exp.id,
              type: 'expedition',
              slug: exp.slug,
              region: exp.region,
              status: exp.status,
              url: `/expeditions/${exp.slug || exp.id}`
            }
          });
          indexedCount++;
          logger.info(`[Expedition] Embedded: ${exp.title}`);
        } catch (e) {
          logger.warn(`Error embedding expedition ${exp.id}: ${e.message}`);
        }
      }
    }
  } catch (err) {
    logger.debug(`Supabase expeditions fetch skipped: ${err.message}`);
  }

  const stats = embeddingService.getStats();
  logger.info(`=== Vector Seeding Complete: ${indexedCount} items indexed. Total store: ${stats.totalDocuments} vectors ===`);
  return {
    indexedCount,
    stats
  };
};

if (require.main === module) {
  seedAllEmbeddings()
    .then((res) => {
      console.log('Seeding finished:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedAllEmbeddings;
