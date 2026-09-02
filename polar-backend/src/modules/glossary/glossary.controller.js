const service = require('./glossary.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getAll = asyncHandler(async (req, res) => {
  const data = service.getAll(req.query);
  return apiResponse.success(res, data, 'Glossary terms retrieved');
});

const getById = asyncHandler(async (req, res) => {
  const data = service.getById(req.params.id);
  return apiResponse.success(res, data, 'Glossary term retrieved');
});

module.exports = {
  getAll,
  getById
};
