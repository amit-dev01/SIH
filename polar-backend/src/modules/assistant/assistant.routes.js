const express = require('express');
const router = express.Router();
const ctrl = require('./assistant.controller');

/**
 * @swagger
 * /api/v1/assistant:
 *   post:
 *     summary: AI Assistant & RAG Module (POLARIS Assistant)
 *     tags: [Assistant]
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
 *                 example: What observations are made at Bharati station?
 *               context:
 *                 type: object
 *                 properties:
 *                   type: { type: string, example: dataset }
 *                   id: { type: string, example: POL-ANT-2024-001 }
 *                   title: { type: string, example: Bharati Meteorology }
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *     responses:
 *       200:
 *         description: Markdown scientific answer with structured sources array
 */
router.post('/', ctrl.ask);

module.exports = router;
