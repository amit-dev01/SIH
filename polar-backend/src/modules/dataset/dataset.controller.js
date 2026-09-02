const service = require('./dataset.service');
const {
  createDatasetSchema,
  updateDatasetSchema,
  queryDatasetSchema
} = require('./dataset.validators');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getAll = asyncHandler(async (req, res) => {
  const validatedQuery = queryDatasetSchema.parse(req.query);
  const result = await service.getAll(validatedQuery);
  return apiResponse.success(res, result.data, 'Datasets fetched', 200, result.meta);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return apiResponse.success(res, data, 'Dataset fetched');
});

const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    return apiResponse.error(res, 'Dataset file is required', 400);
  }

  const validatedBody = createDatasetSchema.parse(req.body);
  const data = await service.create(validatedBody, req.file, req.user.id);
  return apiResponse.success(res, data, 'Dataset created', 201);
});

const download = asyncHandler(async (req, res) => {
  const url = await service.download(req.params.id);
  return apiResponse.success(res, { downloadUrl: url }, 'Download URL retrieved');
});

const update = asyncHandler(async (req, res) => {
  const validatedBody = updateDatasetSchema.parse(req.body);
  const data = await service.update(req.params.id, validatedBody, req.user.id, req.user.role);
  return apiResponse.success(res, data, 'Dataset updated');
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req.user.role);
  return apiResponse.success(res, null, result.message || 'Dataset deleted');
});

const exportDataset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format } = req.query;
  const result = await service.exportDataset(id, format);
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  return res.send(result.content);
});

const nlSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return apiResponse.error(res, 'Query is required in request body', 400);
  }
  const result = await service.nlSearch(query);
  return apiResponse.success(res, result, 'Natural language query interpreted');
});

module.exports = {
  getAll,
  getOne,
  create,
  download,
  exportDataset,
  nlSearch,
  update,
  remove
};
