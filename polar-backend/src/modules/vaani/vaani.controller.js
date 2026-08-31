const service = require('./vaani.service');
const { translateSchema, synthesizeSchema, podcastSchema, SUPPORTED_LANGUAGES } = require('./vaani.validators');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

const getLanguages = asyncHandler(async (req, res) => {
  return apiResponse.success(res, SUPPORTED_LANGUAGES, 'Supported languages fetched');
});

const getDailyBulletin = asyncHandler(async (req, res) => {
  const lang = (req.query.lang || 'hi').toLowerCase();
  const data = await service.getDailyBulletin(lang);
  return apiResponse.success(res, data, 'Daily polar bulletin generated');
});

const translate = asyncHandler(async (req, res) => {
  const { text, targetLang, sourceLang } = translateSchema.parse(req.body);
  const translated = await service.translateText(text, targetLang, sourceLang);
  return apiResponse.success(
    res,
    {
      original: text,
      translated,
      targetLang,
      sourceLang
    },
    'Text translated successfully'
  );
});

const synthesize = asyncHandler(async (req, res) => {
  const { text, lang, format } = synthesizeSchema.parse(req.body);
  const data = await service.synthesizeSpeech(text, lang, format);
  return apiResponse.success(res, data, 'Speech synthesized successfully');
});

const generatePodcast = asyncHandler(async (req, res) => {
  const { topic, lang, station } = podcastSchema.parse(req.body);
  const data = await service.generatePodcast(topic, lang, station);
  return apiResponse.success(res, data, 'Podcast generated successfully', 201);
});

module.exports = {
  getLanguages,
  getDailyBulletin,
  translate,
  synthesize,
  generatePodcast
};
