const service = require('./faqs.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getAll = asyncHandler(async (req, res) => {
  const data = service.getAll(req.query);
  return apiResponse.success(res, data, 'FAQs retrieved');
});

module.exports = {
  getAll
};
