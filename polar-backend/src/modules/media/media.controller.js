const service = require('./media.service');
const { uploadMediaSchema, queryMediaSchema } = require('./media.validators');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return apiResponse.error(res, 'No file provided', 400);
  }

  const validatedBody = uploadMediaSchema.parse(req.body);
  const data = await service.upload(req.file, validatedBody, req.user.id);
  return apiResponse.success(res, data, 'Media uploaded', 201);
});

const bulkUpload = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return apiResponse.error(res, 'No files provided', 400);
  }

  const data = await service.bulkUpload(req.files, req.body.metadata, req.user.id);
  return apiResponse.success(res, data, 'Bulk upload completed', 201);
});

const getAll = asyncHandler(async (req, res) => {
  const validatedQuery = queryMediaSchema.parse(req.query);
  const result = await service.getAll(validatedQuery);
  return apiResponse.success(res, result.data, 'Media list fetched', 200, result.meta);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return apiResponse.success(res, data, 'Media fetched');
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req.user.id, req.user.role);
  return apiResponse.success(res, null, result.message || 'Media deleted');
});

module.exports = {
  upload,
  bulkUpload,
  getAll,
  getOne,
  remove
};
