const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');
const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

// Local backup store path
const DATA_DIR = path.join(__dirname, '../../../data');
const STORE_FILE = path.join(DATA_DIR, 'embeddings_store.json');

// In-memory vector store cache: Map<id, { id, sourceType, sourceId, title, content, metadata, embedding, updatedAt }>
const memoryStore = new Map();
let isInitialized = false;

/**
 * Ensure storage directory and load persisted embeddings into memory
 */
const initStore = () => {
  if (isInitialized) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item && item.id && Array.isArray(item.embedding)) {
            memoryStore.set(item.id, item);
          }
        });
        logger.info(`Loaded ${memoryStore.size} vector embeddings into memory store.`);
      }
    }
  } catch (err) {
    logger.warn(`Failed to read local vector store: ${err.message}`);
  }

  isInitialized = true;
};

/**
 * Persist in-memory store to local JSON file for persistence across restarts
 */
const persistStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const items = Array.from(memoryStore.values());
    fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    logger.warn(`Failed to persist vector store to disk: ${err.message}`);
  }
};

/**
 * Deterministic local pseudo-embedding (768 dimensions) fallback in case Gemini API is offline
 */
const generateLocalFallbackVector = (text, dim = 768) => {
  const vec = new Array(dim).fill(0);
  const clean = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    vec[0] = 1.0;
    return vec;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash * 31 + word.charCodeAt(j)) | 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1.0 / (i + 1);

    // Context bigram
    if (i < words.length - 1) {
      const biHash = (hash * 37 + words[i + 1].charCodeAt(0)) | 0;
      const biIdx = Math.abs(biHash) % dim;
      vec[biIdx] += 0.5;
    }
  }

  // Normalize to unit vector
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dim; i++) {
    vec[i] = vec[i] / norm;
  }

  return vec;
};

/**
 * Generate 768-dimensional embedding using Google Gemini (gemini-embedding-001)
 */
const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return generateLocalFallbackVector('empty');
  }

  const cleanText = text.slice(0, 4000).trim(); // Truncate to reasonable context chunk
  const keys = config.geminiApiKeys || [];

  if (keys.length > 0) {
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const activeKey = keys[attempt];
      try {
        const genAI = new GoogleGenerativeAI(activeKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

        const result = await model.embedContent({
          content: { parts: [{ text: cleanText }] },
          outputDimensionality: 768
        });

        if (result && result.embedding && Array.isArray(result.embedding.values)) {
          return result.embedding.values;
        }
      } catch (err) {
        logger.warn(`Gemini Embedding key [${attempt + 1}/${keys.length}] warning: ${err.message}`);
      }
    }
  }

  // Fallback to local vectorizer
  logger.info('Using local semantic fallback vectorizer for embedding.');
  return generateLocalFallbackVector(cleanText, 768);
};

/**
 * Compute Cosine Similarity between two numeric vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Upsert a scientific document chunk into both Supabase pgvector and in-memory/persisted store
 */
const upsertDocument = async ({ id, sourceType, sourceId, title, content, metadata = {} }) => {
  initStore();

  const embedText = `${title}\n${content}\n${metadata.region || ''} ${metadata.discipline || ''} ${metadata.tags?.join(' ') || ''}`;
  const embedding = await generateEmbedding(embedText);

  const doc = {
    id: id || `${sourceType.toLowerCase()}:${sourceId}`,
    sourceType: sourceType.toUpperCase(),
    sourceId: String(sourceId),
    title,
    content,
    metadata,
    embedding,
    updatedAt: new Date().toISOString()
  };

  // 1. Update in-memory & file store
  memoryStore.set(doc.id, doc);
  persistStore();

  // 2. Upsert to Supabase if scientific_embeddings table exists
  try {
    const { error } = await supabase.from('scientific_embeddings').upsert({
      id: doc.id,
      source_type: doc.sourceType,
      source_id: doc.sourceId,
      title: doc.title,
      content: doc.content,
      metadata: doc.metadata,
      embedding: doc.embedding,
      updated_at: doc.updatedAt
    });

    if (error) {
      logger.debug(`Supabase scientific_embeddings sync notice: ${error.message}`);
    } else {
      logger.info(`Synced embedding [${doc.id}] to Supabase pgvector.`);
    }
  } catch (err) {
    logger.debug(`Supabase scientific_embeddings skipped: ${err.message}`);
  }

  return doc;
};

/**
 * Delete a document from vector store
 */
const deleteDocument = async (id) => {
  initStore();
  memoryStore.delete(id);
  persistStore();

  try {
    await supabase.from('scientific_embeddings').delete().eq('id', id);
  } catch (err) {
    logger.debug(`Supabase delete skipped: ${err.message}`);
  }
};

/**
 * Perform semantic similarity search across scientific embeddings
 */
const searchSimilar = async ({ query, topK = 4, threshold = 0.35, filterSourceType = null }) => {
  initStore();

  if (!query || typeof query !== 'string') return [];

  const queryVec = await generateEmbedding(query);

  // 1. Attempt Supabase RPC if table and function exist
  try {
    const { data: rpcResults, error: rpcError } = await supabase.rpc('match_scientific_embeddings', {
      query_embedding: queryVec,
      match_threshold: threshold,
      match_count: topK,
      filter_source_type: filterSourceType ? filterSourceType.toUpperCase() : null
    });

    if (!rpcError && Array.isArray(rpcResults) && rpcResults.length > 0) {
      return rpcResults.map((r) => ({
        id: r.id,
        sourceType: r.source_type,
        sourceId: r.source_id,
        title: r.title,
        content: r.content,
        metadata: r.metadata,
        similarity: parseFloat(r.similarity.toFixed(4))
      }));
    }
  } catch (err) {
    logger.debug(`Supabase RPC match skipped, using in-memory vector search: ${err.message}`);
  }

  // 2. High-speed in-memory vector similarity fallback
  const results = [];
  const filterType = filterSourceType ? filterSourceType.toUpperCase() : null;

  for (const item of memoryStore.values()) {
    if (filterType && item.sourceType !== filterType) {
      continue;
    }

    const similarity = cosineSimilarity(queryVec, item.embedding);
    if (similarity >= threshold) {
      results.push({
        id: item.id,
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        title: item.title,
        content: item.content,
        metadata: item.metadata,
        similarity: parseFloat(similarity.toFixed(4))
      });
    }
  }

  // Sort descending by similarity
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
};

/**
 * Get statistics of the vector index
 */
const getStats = () => {
  initStore();
  const byType = {};
  for (const item of memoryStore.values()) {
    byType[item.sourceType] = (byType[item.sourceType] || 0) + 1;
  }

  return {
    totalDocuments: memoryStore.size,
    vectorDimensions: 768,
    model: 'gemini-embedding-001',
    byType,
    isInitialized: true
  };
};

// Initialize on module import
initStore();

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  upsertDocument,
  deleteDocument,
  searchSimilar,
  getStats,
  initStore
};
