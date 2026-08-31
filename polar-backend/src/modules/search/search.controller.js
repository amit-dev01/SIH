const service = require('./search.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const search = asyncHandler(async (req, res) => {
  const { q, type, region, year, tags, page, limit } = req.query;

  if (!q || q.trim().length < 2) {
    return apiResponse.error(res, 'Search query must be at least 2 characters', 400);
  }

  const data = await service.search({
    q,
    type,
    region,
    year,
    tags,
    page,
    limit
  });

  return apiResponse.success(res, data.results, 'Search results', 200, {
    ...data.meta,
    counts: data.counts,
    total: data.total
  });
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
