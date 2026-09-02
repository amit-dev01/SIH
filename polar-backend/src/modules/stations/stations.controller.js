const service = require('./stations.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getAll = asyncHandler(async (req, res) => {
  const { region } = req.query;
  const data = service.getAll(region);
  return apiResponse.success(res, data, 'Stations retrieved successfully');
});

const getById = asyncHandler(async (req, res) => {
  const data = service.getById(req.params.id);
  return apiResponse.success(res, data, 'Station retrieved successfully');
});

module.exports = { getAll, getById };
