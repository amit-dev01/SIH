const { z } = require('zod');

const DATASET_FORMATS = ['CSV', 'JSON', 'NETCDF', 'XLSX', 'PDF'];

const createDatasetSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be between 3 and 300 characters')
    .max(300, 'Title must be between 3 and 300 characters'),
  description: z.string().max(3000, 'Description must be at most 3000 characters').optional(),
  format: z.enum(DATASET_FORMATS, {
    errorMap: () => ({ message: `Format must be one of: ${DATASET_FORMATS.join(', ')}` })
  }),
  expeditionId: z
    .string()
    .uuid('expeditionId must be a valid UUID')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  doi: z.string().max(200, 'DOI must be at most 200 characters').optional(),
  license: z.string().max(100).default('CC-BY-4.0'),
  tags: z.string().optional()
});

const updateDatasetSchema = createDatasetSchema.partial();

const queryDatasetSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  format: z.enum(DATASET_FORMATS).optional(),
  expeditionId: z.string().uuid('expeditionId must be a valid UUID').optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'title', 'download_count', 'file_size']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  DATASET_FORMATS,
  createDatasetSchema,
  updateDatasetSchema,
  queryDatasetSchema
};
