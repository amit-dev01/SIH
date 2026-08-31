const router = require('express').Router();
const ctrl = require('./outreach.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// Public
router.get('/published', ctrl.getPublished);

// Protected (Researcher/Admin)
router.post(
  '/generate',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.generate
);

router.get(
  '/drafts',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.getDrafts
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.getOne
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  ctrl.update
);

// Admin only
router.put(
  '/:id/approve',
  authenticate,
  authorize('ADMIN'),
  ctrl.approve
);

router.put(
  '/:id/reject',
  authenticate,
  authorize('ADMIN'),
  ctrl.reject
);

router.put(
  '/:id/publish',
  authenticate,
  authorize('ADMIN'),
  ctrl.publish
);

router.put(
  '/:id/schedule',
  authenticate,
  authorize('ADMIN'),
  ctrl.schedule
);

module.exports = router;
