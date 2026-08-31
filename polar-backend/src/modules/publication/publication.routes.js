const router = require('express').Router();
const ctrl = require('./publication.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { uploadSingle } = require('../../middleware/upload');

/**
 * @swagger
 * /publications:
 *   get:
 *     summary: List scientific publications
 *     tags: [Publications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated publications list
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /publications/stats:
 *   get:
 *     summary: Get publication statistics (totals, breakdown by year and expedition)
 *     tags: [Publications]
 *     responses:
 *       200:
 *         description: Publication statistics
 */
router.get('/stats', ctrl.getStats);

/**
 * @swagger
 * /publications/{id}:
 *   get:
 *     summary: Get publication by ID
 *     tags: [Publications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Publication details
 *       404:
 *         description: Publication not found
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /publications:
 *   post:
 *     summary: Add a new research paper / publication (with optional PDF file)
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, authors]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional PDF paper file
 *               title:
 *                 type: string
 *               abstract:
 *                 type: string
 *               authors:
 *                 type: string
 *                 description: JSON array string or comma-separated author names
 *               journal:
 *                 type: string
 *               doi:
 *                 type: string
 *               tags:
 *                 type: string
 *     responses:
 *       201:
 *         description: Publication created
 */
router.post(
  '/',
  uploadSingle,
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.create
);

/**
 * @swagger
 * /publications/{id}:
 *   put:
 *     summary: Update publication details
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Publication updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.update
);

/**
 * @swagger
 * /publications/{id}:
 *   delete:
 *     summary: Delete a publication (Admin only)
 *     tags: [Publications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Publication deleted
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  ctrl.remove
);

module.exports = router;
