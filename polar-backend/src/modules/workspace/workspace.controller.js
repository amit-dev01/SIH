const service = require('./workspace.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const data = service.getBookmarks(userId);
  return apiResponse.success(res, data, 'Bookmarks retrieved');
});

const saveBookmark = asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const { entityId, entityType, title, url } = req.body;
  const result = service.toggleBookmark(userId, { entityId, entityType, title, url });
  return apiResponse.success(res, result, result.message);
});

const createApiKey = asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const { name } = req.body;
  const data = service.generateApiKey(userId, name);
  return apiResponse.success(res, data, 'RESTful API key generated successfully', 201);
});

module.exports = {
  getBookmarks,
  saveBookmark,
  createApiKey
};
