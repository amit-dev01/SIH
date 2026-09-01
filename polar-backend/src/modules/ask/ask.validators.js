const { z } = require('zod');

const REGIONS = ['ARCTIC', 'ANTARCTIC', 'HIMALAYA', 'SOUTHERN_OCEAN'];

const askQuestionSchema = z.object({
  question: z
    .string({ required_error: 'Question is required' })
    .min(3, 'Question must be at least 3 characters')
    .max(1000, 'Question must be at most 1000 characters'),
  region: z
    .enum(REGIONS, {
      errorMap: () => ({ message: `Region must be one of: ${REGIONS.join(', ')}` })
    })
    .optional(),
  language: z.string().optional().default('en')
});

module.exports = {
  askQuestionSchema,
  REGIONS
};
