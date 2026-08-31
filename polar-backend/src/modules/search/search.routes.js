const router = require('express').Router();
const ctrl = require('./search.controller');

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Unified full-text search across Expeditions, Publications, Media, and Datasets
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Search query string (min 2 characters)
 *       - in: query
 *         name: type
 *         schema: { type: string, example: "expedition,publication,media,dataset" }
 *         description: Comma-separated content types to include
 *       - in: query
 *         name: region
 *         schema: { type: string, enum: [ARCTIC, ANTARCTIC, HIMALAYA, SOUTHERN_OCEAN] }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Unified search results with type breakdown counts
 */
router.get('/', ctrl.search);

/**
 * @swagger
 * /search/suggest:
 *   get:
 *     summary: Search autocomplete title suggestions
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Prefix or query keyword
 *     responses:
 *       200:
 *         description: List of suggestions
 */
router.get('/suggest', ctrl.suggest);

module.exports = router;
