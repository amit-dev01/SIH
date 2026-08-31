const router = require('express').Router();
const ctrl = require('./analytics.controller');
const { authenticate, authorize } = require('../../middleware/auth');

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Overall counts, totals, generated content metrics, and recent activity (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Overview analytics data
 */
router.get('/overview', authenticate, authorize('ADMIN'), ctrl.getOverview);

/**
 * @swagger
 * /analytics/popular:
 *   get:
 *     summary: Top expeditions, most downloaded datasets, recent papers, and recent media
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Popular content highlights
 */
router.get('/popular', ctrl.getPopular);

/**
 * @swagger
 * /analytics/timeline:
 *   get:
 *     summary: All expedition start/end dates and statuses for timeline visualization
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Expedition timeline events
 */
router.get('/timeline', ctrl.getTimeline);

/**
 * @swagger
 * /analytics/content-calendar:
 *   get:
 *     summary: Date-grouped scheduled and published outreach calendar (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Calendar dictionary grouped by date
 */
router.get('/content-calendar', authenticate, authorize('ADMIN'), ctrl.getContentCalendar);

/**
 * @swagger
 * /analytics/activity-log:
 *   get:
 *     summary: Paginated administrative audit logs (Admin only)
 *     tags: [Analytics]
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
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *       - in: query
 *         name: entityType
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Paginated activity audit logs
 */
router.get('/activity-log', authenticate, authorize('ADMIN'), ctrl.getActivityLog);

module.exports = router;
