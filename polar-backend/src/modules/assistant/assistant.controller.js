const service = require('./assistant.service');
const asyncHandler = require('../../utils/asyncHandler');

const ask = asyncHandler(async (req, res) => {
  const { question, context, messages } = req.body;
  const result = await service.askAssistant({ question, context, messages });
  // Send result with root `answer` and `sources` as required by frontend contract
  return res.status(200).json(result);
});

module.exports = {
  ask
};
