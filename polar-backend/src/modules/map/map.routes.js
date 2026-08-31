const router = require('express').Router();
const ctrl = require('./map.controller');

// All public — map data is read-only
router.get('/locations', ctrl.getLocations);
router.get('/expeditions', ctrl.getExpeditions);
router.get('/media', ctrl.getMedia);

module.exports = router;
