const router = require('express').Router();
const ctrl = require('./dataset.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { uploadSingle } = require('../../middleware/upload');

// Public
router.get('/', ctrl.getAll);
router.get('/:id/download', ctrl.download);
router.get('/:id', ctrl.getOne);

// Protected
router.post(
  '/',
  uploadSingle,
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.create
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  ctrl.remove
);

module.exports = router;
