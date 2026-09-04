const embeddingService = require('./embedding.service');
const apiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Perform vector similarity search
 * POST /api/v1/embeddings/search
 * Body: { query, topK, threshold, filterSourceType }
 */
const searchEmbeddings = asyncHandler(async (req, res) => {
  const { query, topK = 5, threshold = 0.3, filterSourceType = null } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return apiResponse.error(res, 'Query string is required', 400);
  }

  const results = await embeddingService.searchSimilar({
    query: query.trim(),
    topK: parseInt(topK, 10) || 5,
    threshold: parseFloat(threshold) || 0.3,
    filterSourceType
  });

  return apiResponse.success(
    res,
    {
      query: query.trim(),
      totalMatches: results.length,
      matches: results
    },
    'Semantic vector search completed'
  );
});

/**
 * Get vector index statistics
 * GET /api/v1/embeddings/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = embeddingService.getStats();
  return apiResponse.success(res, stats, 'Vector index statistics retrieved');
});

/**
 * Trigger corpus reindexing
 * POST /api/v1/embeddings/reindex
 */
const triggerReindex = asyncHandler(async (req, res) => {
  const reindexCorpus = require('../../../scripts/seed_embeddings');
  const result = await reindexCorpus();
  return apiResponse.success(res, result, 'Corpus reindexing completed successfully');
});

module.exports = {
  searchEmbeddings,
  getStats,
  triggerReindex
};
