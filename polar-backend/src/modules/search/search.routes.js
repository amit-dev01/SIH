const router = require('express').Router();
const ctrl = require('./search.controller');

router.get('/', ctrl.search);
router.get('/suggest', ctrl.suggest);

module.exports = router;
