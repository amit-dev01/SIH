const express = require('express');
const router = express.Router();
const controller = require('./embedding.controller');

// Search vectors semantically
router.post('/search', controller.searchEmbeddings);

// Get index statistics
router.get('/stats', controller.getStats);

// Trigger re-indexing
router.post('/reindex', controller.triggerReindex);

module.exports = router;
