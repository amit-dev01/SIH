const express = require('express');
const router = express.Router();
const ctrl = require('./workspace.controller');

/**
 * @swagger
 * /api/v1/workspace/bookmarks:
 *   get:
 *     summary: Returns user's saved dataset & article bookmarks
 *     tags: [Workspace]
 *     responses:
 *       200:
 *         description: List of saved bookmarks
 */
router.get('/bookmarks', ctrl.getBookmarks);

/**
 * @swagger
 * /api/v1/workspace/bookmarks:
 *   post:
 *     summary: Adds or removes a dataset or article from user bookmarks
 *     tags: [Workspace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityId]
 *             properties:
 *               entityId: { type: string, example: "POL-ANT-2024-001" }
 *               entityType: { type: string, enum: [dataset, knowledge], example: "dataset" }
 *               title: { type: string, example: "Bharati Station Meteorology" }
 *     responses:
 *       200:
 *         description: Bookmark toggled
 */
router.post('/bookmarks', ctrl.saveBookmark);

/**
 * @swagger
 * /api/v1/workspace/api-keys:
 *   post:
 *     summary: Generates a RESTful API key for bulk scientific data access
 *     tags: [Workspace]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "HPC Processing Cluster Key" }
 *     responses:
 *       201:
 *         description: Newly generated API key and scopes
 */
router.post('/api-keys', ctrl.createApiKey);

module.exports = router;
