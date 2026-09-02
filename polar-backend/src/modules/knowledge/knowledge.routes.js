const express = require('express');
const router = express.Router();
const ctrl = require('./knowledge.controller');

/**
 * @swagger
 * /api/v1/knowledge:
 *   get:
 *     summary: Get all knowledge base research articles
 *     tags: [Knowledge]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of knowledge base articles
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /api/v1/knowledge/{id}:
 *   get:
 *     summary: Get single knowledge article by slug ID or UUID
 *     tags: [Knowledge]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full knowledge article with markdown body
 *       404:
 *         description: Article not found
 */
router.get('/:id', ctrl.getById);

module.exports = router;
