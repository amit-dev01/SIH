const router = require('express').Router();
const ctrl = require('./expedition.controller');
const { authenticate, authorize } = require('../../middleware/auth');

/**
 * @swagger
 * /expeditions:
 *   get:
 *     summary: List all polar scientific expeditions
 *     tags: [Expeditions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Items per page
 *       - in: query
 *         name: region
 *         schema: { type: string, enum: [ARCTIC, ANTARCTIC, HIMALAYA, SOUTHERN_OCEAN] }
 *         description: Polar region filter
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PLANNED, ONGOING, COMPLETED] }
 *         description: Expedition status filter
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         description: Year of commencement
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search keyword
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [start_date, created_at], default: start_date }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated list of expeditions
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /expeditions/{id}/stats:
 *   get:
 *     summary: Get statistics for an expedition
 *     tags: [Expeditions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Expedition UUID
 *     responses:
 *       200:
 *         description: Statistics object (publication, media, dataset counts and total downloads)
 */
router.get('/:id/stats', ctrl.getStats);

/**
 * @swagger
 * /expeditions/{id}:
 *   get:
 *     summary: Get expedition details by ID or Slug
 *     tags: [Expeditions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Expedition UUID or slug string
 *     responses:
 *       200:
 *         description: Detailed expedition record with linked media, papers, datasets
 *       404:
 *         description: Expedition not found
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /expeditions:
 *   post:
 *     summary: Create a new polar expedition
 *     tags: [Expeditions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, region, startDate]
 *             properties:
 *               title: { type: string, example: "44th Indian Scientific Expedition to Antarctica" }
 *               description: { type: string, example: "Scientific exploration and meteorological observations in East Antarctica." }
 *               region: { type: string, enum: [ARCTIC, ANTARCTIC, HIMALAYA, SOUTHERN_OCEAN], example: "ANTARCTIC" }
 *               startDate: { type: string, format: date-time, example: "2026-11-01T00:00:00Z" }
 *               endDate: { type: string, format: date-time, example: "2027-03-31T00:00:00Z" }
 *               status: { type: string, enum: [PLANNED, ONGOING, COMPLETED], default: "PLANNED" }
 *               summary: { type: string, example: "Annual Antarctic scientific mission." }
 *               coverImageUrl: { type: string, example: "https://example.com/cover.jpg" }
 *     responses:
 *       201:
 *         description: Expedition created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize('ADMIN', 'RESEARCHER'), ctrl.create);

/**
 * @swagger
 * /expeditions/{id}:
 *   put:
 *     summary: Update an expedition
 *     tags: [Expeditions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Expedition updated successfully
 */
router.put('/:id', authenticate, authorize('ADMIN', 'RESEARCHER'), ctrl.update);

/**
 * @swagger
 * /expeditions/{id}:
 *   delete:
 *     summary: Delete an expedition
 *     tags: [Expeditions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expedition deleted successfully
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.remove);

module.exports = router;
