const { z } = require('zod');

const authorsSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return val;
}, z.array(z.string().min(1, 'Author name cannot be empty'), {
  required_error: 'Authors are required'
}).min(1, 'At least one author is required'));

const createPublicationSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be between 5 and 500 characters')
    .max(500, 'Title must be between 5 and 500 characters'),
  abstract: z.string().max(5000, 'Abstract must be at most 5000 characters').optional(),
  authors: authorsSchema,
  journal: z.string().max(200, 'Journal name must be at most 200 characters').optional(),
  doi: z.string().max(200, 'DOI must be at most 200 characters').optional(),
  pdfUrl: z
    .string()
    .url('pdfUrl must be a valid URL')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  expeditionId: z
    .string()
    .uuid('expeditionId must be a valid UUID')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  publishedDate: z
    .string()
    .datetime({ offset: true, message: 'publishedDate must be a valid ISO datetime' })
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  tags: z.string().optional()
});

const updatePublicationSchema = createPublicationSchema.partial();

const queryPublicationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  expeditionId: z.string().uuid('expeditionId must be a valid UUID').optional(),
  year: z.coerce.number().int().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['published_date', 'created_at', 'title']).default('published_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  createPublicationSchema,
  updatePublicationSchema,
  queryPublicationSchema
};
