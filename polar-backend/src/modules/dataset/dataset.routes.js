const router = require('express').Router();
const ctrl = require('./dataset.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { uploadSingle } = require('../../middleware/upload');

/**
 * @swagger
 * /datasets:
 *   get:
 *     summary: List scientific datasets
 *     tags: [Datasets]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [CSV, JSON, NETCDF, XLSX, PDF] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated datasets list
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /datasets/{id}/download:
 *   get:
 *     summary: Request download for a dataset (increments download counter)
 *     tags: [Datasets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Download URL retrieved
 */
router.get('/:id/download', ctrl.download);

/**
 * @swagger
 * /datasets/{id}:
 *   get:
 *     summary: Get dataset by ID
 *     tags: [Datasets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dataset details
 *       404:
 *         description: Dataset not found
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /datasets:
 *   post:
 *     summary: Upload and register a new scientific dataset
 *     tags: [Datasets]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, title, format]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [CSV, JSON, NETCDF, XLSX, PDF]
 *               description:
 *                 type: string
 *               license:
 *                 type: string
 *                 default: "CC-BY-4.0"
 *               tags:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dataset created
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
 * /datasets/{id}:
 *   put:
 *     summary: Update dataset metadata
 *     tags: [Datasets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dataset updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.update
);

/**
 * @swagger
 * /datasets/{id}:
 *   delete:
 *     summary: Delete a dataset and remove file from storage (Admin only)
 *     tags: [Datasets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dataset deleted
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  ctrl.remove
);

module.exports = router;
