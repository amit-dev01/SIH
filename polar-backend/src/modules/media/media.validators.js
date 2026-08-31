const { z } = require('zod');

const MEDIA_TYPES = ['PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO'];

const uploadMediaSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be between 3 and 200 characters')
    .max(200, 'Title must be between 3 and 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  type: z.enum(MEDIA_TYPES, {
    errorMap: () => ({ message: `Type must be one of: ${MEDIA_TYPES.join(', ')}` })
  }),
  expeditionId: z
    .string()
    .uuid('expeditionId must be a valid UUID')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  tags: z.string().optional(),
  locationLat: z.coerce.number().min(-90).max(90).optional(),
  locationLng: z.coerce.number().min(-180).max(180).optional(),
  capturedAt: z
    .string()
    .datetime({ offset: true, message: 'capturedAt must be a valid ISO datetime' })
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val))
});

const queryMediaSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  type: z.enum(MEDIA_TYPES).optional(),
  expeditionId: z.string().uuid('expeditionId must be a valid UUID').optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['created_at', 'captured_at', 'file_size']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  MEDIA_TYPES,
  uploadMediaSchema,
  queryMediaSchema
};
