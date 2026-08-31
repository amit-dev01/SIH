const service = require('./outreach.service');
const {
  generateSchema,
  updateContentSchema,
  scheduleSchema,
  queryOutreachSchema
} = require('./outreach.validators');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const generate = asyncHandler(async (req, res) => {
  const validatedBody = generateSchema.parse(req.body);
  const data = await service.generate(validatedBody, req.user.id);
  return apiResponse.success(res, data, 'Outreach content generated', 201);
});

const getDrafts = asyncHandler(async (req, res) => {
  const validatedQuery = queryOutreachSchema.parse(req.query);
  const result = await service.getDrafts(validatedQuery, req.user.id);
  return apiResponse.success(res, result.data, 'Drafts fetched', 200, result.meta);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return apiResponse.success(res, data, 'Outreach content fetched');
});

const update = asyncHandler(async (req, res) => {
  const validatedBody = updateContentSchema.parse(req.body);
  const data = await service.update(req.params.id, validatedBody, req.user.id);
  return apiResponse.success(res, data, 'Outreach content updated');
});

const approve = asyncHandler(async (req, res) => {
  const data = await service.approve(req.params.id, req.user.id);
  return apiResponse.success(res, data, 'Outreach content approved');
});

const reject = asyncHandler(async (req, res) => {
  const data = await service.reject(req.params.id);
  return apiResponse.success(res, data, 'Outreach content rejected');
});

const publish = asyncHandler(async (req, res) => {
  const data = await service.publish(req.params.id);
  return apiResponse.success(res, data, 'Outreach content published');
});

const schedule = asyncHandler(async (req, res) => {
  const validatedBody = scheduleSchema.parse(req.body);
  const data = await service.schedule(req.params.id, validatedBody.scheduledAt);
  return apiResponse.success(res, data, 'Outreach content scheduled');
});

const getPublished = asyncHandler(async (req, res) => {
  const validatedQuery = queryOutreachSchema.parse(req.query);
  const result = await service.getPublished(validatedQuery);
  return apiResponse.success(res, result.data, 'Published content fetched', 200, result.meta);
});

module.exports = {
  generate,
  getDrafts,
  getOne,
  update,
  approve,
  reject,
  publish,
  schedule,
  getPublished
};
