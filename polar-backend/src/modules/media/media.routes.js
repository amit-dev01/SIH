const router = require('express').Router();
const ctrl = require('./media.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../../middleware/upload');

// Public
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Protected — note upload middleware comes BEFORE auth
// because multer needs to parse the multipart form first
router.post(
  '/upload',
  uploadSingle,
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.upload
);

router.post(
  '/bulk-upload',
  uploadMultiple,
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.bulkUpload
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.remove
);

module.exports = router;
