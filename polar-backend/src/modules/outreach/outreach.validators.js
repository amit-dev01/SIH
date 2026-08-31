const { z } = require('zod');

const SOURCE_TYPES = ['EXPEDITION', 'PUBLICATION', 'MEDIA', 'DATASET', 'CUSTOM'];
const PLATFORMS = ['TWITTER', 'FACEBOOK', 'INSTAGRAM', 'WEBSITE', 'LINKEDIN'];
const STATUSES = ['DRAFT', 'APPROVED', 'REJECTED', 'PUBLISHED'];

const generateSchema = z
  .object({
    sourceType: z.enum(SOURCE_TYPES, {
      errorMap: () => ({ message: `sourceType must be one of: ${SOURCE_TYPES.join(', ')}` })
    }),
    sourceId: z
      .string()
      .uuid('sourceId must be a valid UUID')
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
    platform: z.enum(PLATFORMS, {
      errorMap: () => ({ message: `platform must be one of: ${PLATFORMS.join(', ')}` })
    }),
    customInput: z.string().max(5000, 'customInput must be at most 5000 characters').optional()
  })
  .refine(
    (data) => {
      if (data.sourceType !== 'CUSTOM' && !data.sourceId) {
        return false;
      }
      return true;
    },
    {
      message: 'sourceId is required for non-custom content',
      path: ['sourceId']
    }
  )
  .refine(
    (data) => {
      if (data.sourceType === 'CUSTOM' && (!data.customInput || data.customInput.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'customInput is required when sourceType is CUSTOM',
      path: ['customInput']
    }
  );

const updateContentSchema = z.object({
  contentText: z.string().min(1).max(5000).optional(),
  mediaUrls: z.array(z.string().url('Invalid media URL')).optional()
});

const scheduleSchema = z.object({
  scheduledAt: z
    .string({ required_error: 'scheduledAt is required' })
    .datetime({ offset: true, message: 'scheduledAt must be a valid ISO datetime' })
    .refine((val) => new Date(val) > new Date(), {
      message: 'scheduledAt must be a date and time in the future'
    })
});

const queryOutreachSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  platform: z.string().optional(),
  sourceType: z.string().optional(),
  status: z.string().optional()
});

module.exports = {
  SOURCE_TYPES,
  PLATFORMS,
  STATUSES,
  generateSchema,
  updateContentSchema,
  scheduleSchema,
  queryOutreachSchema
};
