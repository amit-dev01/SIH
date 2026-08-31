const service = require('./search.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const search = asyncHandler(async (req, res) => {
  const { q, type, region, year, tags, page, limit } = req.query;

  if (!q || q.trim().length < 2) {
    return apiResponse.error(res, 'Search query must be at least 2 characters', 400);
  }

  const searchResult = await service.search({
    q,
    type,
    region,
    year,
    tags,
    page,
    limit
  });

  return apiResponse.success(
    res,
    {
      results: searchResult.results,
      counts: searchResult.counts,
      total: searchResult.total
    },
    'Search results',
    200,
    searchResult.meta
  );
});

const suggest = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const data = await service.suggest(q);
  return apiResponse.success(res, data, 'Suggestions fetched');
});

module.exports = {
  search,
  suggest
};
