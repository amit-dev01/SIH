const express = require('express');
const router = express.Router();
const ctrl = require('./glossary.controller');

/**
 * @swagger
 * /api/v1/glossary:
 *   get:
 *     summary: Get searchable A-to-Z polar science glossary with dual definitions
 *     tags: [Glossary]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of glossary items
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /api/v1/glossary/{id}:
 *   get:
 *     summary: Get single glossary term
 *     tags: [Glossary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Glossary item with simple and scientific definitions
 */
router.get('/:id', ctrl.getById);

module.exports = router;
