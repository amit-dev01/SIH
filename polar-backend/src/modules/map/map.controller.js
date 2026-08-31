const service = require('./map.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getLocations = asyncHandler(async (req, res) => {
  const pins = await service.getLocations(req.query);
  return apiResponse.success(res, pins, 'Locations fetched');
});

const getExpeditions = asyncHandler(async (req, res) => {
  const pins = await service.getExpeditions();
  return apiResponse.success(res, pins, 'Expedition locations fetched');
});

const getMedia = asyncHandler(async (req, res) => {
  const pins = await service.getMedia();
  return apiResponse.success(res, pins, 'Media locations fetched');
});

module.exports = {
  getLocations,
  getExpeditions,
  getMedia
};
