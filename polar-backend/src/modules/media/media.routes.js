const router = require('express').Router();
const ctrl = require('./media.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../../middleware/upload');

/**
 * @swagger
 * /media:
 *   get:
 *     summary: List media items
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [PHOTO, VIDEO, DOCUMENT, AUDIO] }
 *       - in: query
 *         name: expeditionId
 *         schema: { type: string }
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of media files
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Get single media item by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Media details
 *       404:
 *         description: Media not found
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload a photo, video, document, or audio file
 *     tags: [Media]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, title, type]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PHOTO, VIDEO, DOCUMENT, AUDIO]
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *                 example: "antarctica,iceberg"
 *               locationLat:
 *                 type: number
 *               locationLng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 */
router.post(
  '/upload',
  uploadSingle,
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.upload
);

/**
 * @swagger
 * /media/bulk-upload:
 *   post:
 *     summary: Bulk upload multiple media files
 *     tags: [Media]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               metadata:
 *                 type: string
 *                 description: JSON string with metadata
 *     responses:
 *       201:
 *         description: Bulk upload results array
 */
router.post(
  '/bulk-upload',
  uploadMultiple,
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.bulkUpload
);

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Delete a media item and remove from storage
 *     tags: [Media]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Media deleted
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.remove
);

module.exports = router;
