const service = require('./publication.service');
const {
  createPublicationSchema,
  updatePublicationSchema,
  queryPublicationSchema
} = require('./publication.validators');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getAll = asyncHandler(async (req, res) => {
  const validatedQuery = queryPublicationSchema.parse(req.query);
  const result = await service.getAll(validatedQuery);
  return apiResponse.success(res, result.data, 'Publications fetched', 200, result.meta);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return apiResponse.success(res, data, 'Publication fetched');
});

const create = asyncHandler(async (req, res) => {
  const validatedBody = createPublicationSchema.parse(req.body);
  const data = await service.create(validatedBody, req.file, req.user.id);
  return apiResponse.success(res, data, 'Publication created', 201);
});

const update = asyncHandler(async (req, res) => {
  const validatedBody = updatePublicationSchema.parse(req.body);
  const data = await service.update(req.params.id, validatedBody, req.user.id, req.user.role);
  return apiResponse.success(res, data, 'Publication updated');
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req.user.role);
  return apiResponse.success(res, null, result.message || 'Publication deleted');
});

const getStats = asyncHandler(async (req, res) => {
  const data = await service.getStats();
  return apiResponse.success(res, data, 'Publication stats fetched');
});

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  getStats
};
