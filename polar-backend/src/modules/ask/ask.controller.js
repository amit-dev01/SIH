const service = require('./ask.service');
const { askQuestionSchema } = require('./ask.validators');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const ask = asyncHandler(async (req, res) => {
  const { question, region, language } = askQuestionSchema.parse(req.body);
  const data = await service.askQuestion(question, region, language);
  return apiResponse.success(res, data, 'Answer generated with research citations');
});

const getSuggestions = asyncHandler(async (req, res) => {
  const data = service.getSuggestions();
  return apiResponse.success(res, data, 'Curated research questions fetched');
});

module.exports = {
  ask,
  getSuggestions
};
