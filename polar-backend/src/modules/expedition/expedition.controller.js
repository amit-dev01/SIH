const service = require('./expedition.service');
const {
  createExpeditionSchema,
  updateExpeditionSchema,
  queryExpeditionSchema
} = require('./expedition.validators');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getAll = asyncHandler(async (req, res) => {
  const validatedQuery = queryExpeditionSchema.parse(req.query);
  const result = await service.getAll(validatedQuery);
  return apiResponse.success(res, result.data, 'Expeditions fetched', 200, result.meta);
});

const getOne = asyncHandler(async (req, res) => {
  const idOrSlug = req.params.id;
  const data = await service.getByIdOrSlug(idOrSlug);
  return apiResponse.success(res, data, 'Expedition fetched');
});

const create = asyncHandler(async (req, res) => {
  const validatedData = createExpeditionSchema.parse(req.body);
  const data = await service.create(validatedData, req.user.id);
  return apiResponse.success(res, data, 'Expedition created', 201);
});

const update = asyncHandler(async (req, res) => {
  const validatedData = updateExpeditionSchema.parse(req.body);
  const data = await service.update(req.params.id, validatedData, req.user.id, req.user.role);
  return apiResponse.success(res, data, 'Expedition updated');
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return apiResponse.success(res, null, 'Expedition deleted');
});

const getStats = asyncHandler(async (req, res) => {
  const data = await service.getStats(req.params.id);
  return apiResponse.success(res, data, 'Stats fetched');
});

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  getStats
};
