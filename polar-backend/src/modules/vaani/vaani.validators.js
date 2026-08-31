const { z } = require('zod');

const SUPPORTED_LANGUAGES = {
  hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  te: { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  bn: { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  mr: { code: 'mr', name: 'Marathi', native: 'मराठी' },
  kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  gu: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  en: { code: 'en', name: 'English', native: 'English' }
};

const langCodes = Object.keys(SUPPORTED_LANGUAGES);

const translateSchema = z.object({
  text: z.string({ required_error: 'Text to translate is required' }).min(2, 'Text must be at least 2 characters'),
  targetLang: z.enum(langCodes, {
    errorMap: () => ({ message: `targetLang must be one of: ${langCodes.join(', ')}` })
  }).default('hi'),
  sourceLang: z.string().optional().default('en')
});

const synthesizeSchema = z.object({
  text: z.string({ required_error: 'Text is required for speech synthesis' }).min(2).max(2000, 'Text must be at most 2000 characters'),
  lang: z.enum(langCodes).default('hi'),
  format: z.enum(['url', 'base64', 'binary']).default('url')
});

const podcastSchema = z.object({
  topic: z.string().min(3).optional().default('Antarctica and Indian Monsoon Connection'),
  lang: z.enum(langCodes).default('hi'),
  station: z.enum(['BHARATI', 'MAITRI', 'HIMADRI', 'HIMANSH', 'GENERAL']).default('BHARATI')
});

module.exports = {
  SUPPORTED_LANGUAGES,
  langCodes,
  translateSchema,
  synthesizeSchema,
  podcastSchema
};
