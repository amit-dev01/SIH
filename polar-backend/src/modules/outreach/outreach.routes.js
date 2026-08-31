const router = require('express').Router();
const ctrl = require('./outreach.controller');
const { authenticate, authorize } = require('../../middleware/auth');

/**
 * @swagger
 * /outreach/published:
 *   get:
 *     summary: Get public feed of published outreach stories and social posts
 *     tags: [Outreach]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: platform
 *         schema: { type: string, enum: [TWITTER, FACEBOOK, INSTAGRAM, WEBSITE, LINKEDIN] }
 *     responses:
 *       200:
 *         description: Paginated published outreach content
 */
router.get('/published', ctrl.getPublished);

/**
 * @swagger
 * /outreach/generate:
 *   post:
 *     summary: Generate AI social media post from expedition, paper, media, dataset, or custom topic
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceType, platform]
 *             properties:
 *               sourceType:
 *                 type: string
 *                 enum: [EXPEDITION, PUBLICATION, MEDIA, DATASET, CUSTOM]
 *                 example: "EXPEDITION"
 *               sourceId:
 *                 type: string
 *                 description: Required if sourceType is not CUSTOM
 *               platform:
 *                 type: string
 *                 enum: [TWITTER, FACEBOOK, INSTAGRAM, WEBSITE, LINKEDIN]
 *                 example: "TWITTER"
 *               customInput:
 *                 type: string
 *                 description: Required if sourceType is CUSTOM
 *     responses:
 *       201:
 *         description: Generated outreach draft
 */
router.post(
  '/generate',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.generate
);

/**
 * @swagger
 * /outreach/drafts:
 *   get:
 *     summary: List generated outreach drafts (Researcher/Admin)
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: platform
 *         schema: { type: string, enum: [TWITTER, FACEBOOK, INSTAGRAM, WEBSITE, LINKEDIN] }
 *     responses:
 *       200:
 *         description: List of drafts
 */
router.get(
  '/drafts',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.getDrafts
);

/**
 * @swagger
 * /outreach/{id}:
 *   get:
 *     summary: Get single outreach content item by ID
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Outreach content details
 */
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.getOne
);

/**
 * @swagger
 * /outreach/{id}:
 *   put:
 *     summary: Edit draft content text or attach media URLs
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contentText: { type: string }
 *               mediaUrls: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Draft updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.update
);

/**
 * @swagger
 * /outreach/{id}/approve:
 *   put:
 *     summary: Approve draft for publication (Admin only)
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Draft approved
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize('ADMIN'),
  ctrl.approve
);

/**
 * @swagger
 * /outreach/{id}/reject:
 *   put:
 *     summary: Reject draft (Admin only)
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Draft rejected
 */
router.put(
  '/:id/reject',
  authenticate,
  authorize('ADMIN'),
  ctrl.reject
);

/**
 * @swagger
 * /outreach/{id}/publish:
 *   put:
 *     summary: Publish approved outreach content (Admin only)
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Content published
 */
router.put(
  '/:id/publish',
  authenticate,
  authorize('ADMIN'),
  ctrl.publish
);

/**
 * @swagger
 * /outreach/{id}/schedule:
 *   put:
 *     summary: Schedule draft for automated future publication (Admin only)
 *     tags: [Outreach]
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
 *             required: [scheduledAt]
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-01T09:00:00Z"
 *     responses:
 *       200:
 *         description: Content scheduled
 */
router.put(
  '/:id/schedule',
  authenticate,
  authorize('ADMIN'),
  ctrl.schedule
);

module.exports = router;
