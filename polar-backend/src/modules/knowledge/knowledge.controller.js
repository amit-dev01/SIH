const service = require('./knowledge.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getAll = asyncHandler(async (req, res) => {
  const data = await service.getAll(req.query);
  return apiResponse.success(res, data, 'Knowledge articles retrieved');
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getById(req.params.id);
  return apiResponse.success(res, data, 'Knowledge article retrieved');
});

module.exports = {
  getAll,
  getById
};
