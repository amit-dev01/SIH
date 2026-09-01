const express = require('express');
const router = express.Router();
const ctrl = require('./ask.controller');

/**
 * @swagger
 * tags:
 *   name: Ask Polar AI
 *   description: RAG-Powered Research Assistant with In-Text DOI Citations (SIH Innovation)
 */

/**
 * @swagger
 * /api/v1/ask/suggestions:
 *   get:
 *     summary: Get curated science and expedition questions for discovery
 *     tags: [Ask Polar AI]
 *     responses:
 *       200:
 *         description: List of categorized discovery questions
 */
router.get('/suggestions', ctrl.getSuggestions);

/**
 * @swagger
 * /api/v1/ask:
 *   post:
 *     summary: Ask a polar science research question and receive an answer with DOI citations
 *     tags: [Ask Polar AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 example: How do black carbon aerosols observed at Bharati Station impact climate?
 *               region:
 *                 type: string
 *                 enum: [ARCTIC, ANTARCTIC, HIMALAYA, SOUTHERN_OCEAN]
 *                 example: ANTARCTIC
 *     responses:
 *       200:
 *         description: Grounded scientific answer with clickable DOI citations and suggested follow-ups
 */
router.post('/', ctrl.ask);

module.exports = router;
