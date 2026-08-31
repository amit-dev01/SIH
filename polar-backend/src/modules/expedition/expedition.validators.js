const { z } = require('zod');

const REGIONS = ['ARCTIC', 'ANTARCTIC', 'HIMALAYA', 'SOUTHERN_OCEAN'];
const STATUSES = ['PLANNED', 'ONGOING', 'COMPLETED'];

const createExpeditionSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be between 3 and 200 characters')
    .max(200, 'Title must be between 3 and 200 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(50, 'Description must be at least 50 characters'),
  region: z.enum(REGIONS, {
    errorMap: () => ({ message: `Region must be one of: ${REGIONS.join(', ')}` })
  }),
  startDate: z
    .string({ required_error: 'startDate is required' })
    .datetime({ offset: true, message: 'startDate must be a valid ISO datetime' }),
  endDate: z
    .string()
    .datetime({ offset: true, message: 'endDate must be a valid ISO datetime' })
    .optional(),
  status: z
    .enum(STATUSES, {
      errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}` })
    })
    .default('PLANNED'),
  summary: z.string().max(2000, 'Summary must be at most 2000 characters').optional(),
  coverImageUrl: z.string().url('coverImageUrl must be a valid URL').optional(),
  leaderId: z.string().uuid('leaderId must be a valid UUID').optional()
});

const updateExpeditionSchema = createExpeditionSchema.partial();

const queryExpeditionSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  region: z.string().optional(),
  status: z.string().optional(),
  year: z.coerce.number().int().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['start_date', 'created_at']).default('start_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  createExpeditionSchema,
  updateExpeditionSchema,
  queryExpeditionSchema
};
