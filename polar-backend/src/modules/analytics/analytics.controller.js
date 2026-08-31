const service = require('./analytics.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getOverview = asyncHandler(async (req, res) => {
  const data = await service.getOverview();
  return apiResponse.success(res, data, 'Analytics overview fetched');
});

const getPopular = asyncHandler(async (req, res) => {
  const data = await service.getPopular();
  return apiResponse.success(res, data, 'Popular content fetched');
});

const getTimeline = asyncHandler(async (req, res) => {
  const data = await service.getTimeline();
  return apiResponse.success(res, data, 'Expedition timeline fetched');
});

const getContentCalendar = asyncHandler(async (req, res) => {
  const data = await service.getContentCalendar();
  return apiResponse.success(res, data, 'Content calendar fetched');
});

const getActivityLog = asyncHandler(async (req, res) => {
  const { page, limit, userId, action, entityType, dateFrom, dateTo } = req.query;
  const result = await service.getActivityLog({
    page,
    limit,
    userId,
    action,
    entityType,
    dateFrom,
    dateTo
  });
  return apiResponse.success(res, result.data, 'Activity logs fetched', 200, result.meta);
});

module.exports = {
  getOverview,
  getPopular,
  getTimeline,
  getContentCalendar,
  getActivityLog
};
