const router = require('express').Router();
const ctrl = require('./map.controller');

/**
 * @swagger
 * /map/locations:
 *   get:
 *     summary: Get all map pins (polar base stations and geo-tagged media)
 *     tags: [Map]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema: { type: string, enum: [ARCTIC, ANTARCTIC, HIMALAYA, SOUTHERN_OCEAN] }
 *       - in: query
 *         name: type
 *         schema: { type: string, example: "PHOTO" }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Array of map pins with coordinates and metadata
 */
router.get('/locations', ctrl.getLocations);

/**
 * @swagger
 * /map/expeditions:
 *   get:
 *     summary: Get polar expedition station coordinates and stats
 *     tags: [Map]
 *     responses:
 *       200:
 *         description: List of expedition station pins
 */
router.get('/expeditions', ctrl.getExpeditions);

/**
 * @swagger
 * /map/media:
 *   get:
 *     summary: Get geo-tagged photos, videos, and media pins
 *     tags: [Map]
 *     responses:
 *       200:
 *         description: List of geo-tagged media pins
 */
router.get('/media', ctrl.getMedia);

module.exports = router;
