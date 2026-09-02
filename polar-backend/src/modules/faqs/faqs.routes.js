const express = require('express');
const router = express.Router();
const ctrl = require('./faqs.controller');

/**
 * @swagger
 * /api/v1/faqs:
 *   get:
 *     summary: Get categorized polar research and portal FAQs
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of FAQs with questions and answers
 */
router.get('/', ctrl.getAll);

module.exports = router;
