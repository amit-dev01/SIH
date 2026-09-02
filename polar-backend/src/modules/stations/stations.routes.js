const express = require('express');
const router = express.Router();
const ctrl = require('./stations.controller');

/**
 * @swagger
 * /api/v1/stations:
 *   get:
 *     summary: Get all NCPOR polar research stations
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [Antarctica, Arctic, Himalaya, Southern_ocean]
 *         description: Filter by region
 *     responses:
 *       200:
 *         description: List of all NCPOR stations with coordinates and latest observations
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /api/v1/stations/{id}:
 *   get:
 *     summary: Get a single station by slug ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Station slug (e.g. maitri-station, bharati-station, himadri-station)
 *     responses:
 *       200:
 *         description: Station detail with coordinates, status, and latest weather
 *       404:
 *         description: Station not found
 */
router.get('/:id', ctrl.getById);

module.exports = router;
