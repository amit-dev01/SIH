const router = require('express').Router();
const ctrl = require('./expedition.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// Public routes (no auth needed)
router.get('/', ctrl.getAll);
router.get('/:id/stats', ctrl.getStats);
router.get('/:id', ctrl.getOne);

// Protected routes (auth needed)
router.post('/', authenticate, authorize('ADMIN', 'RESEARCHER'), ctrl.create);
router.put('/:id', authenticate, authorize('ADMIN', 'RESEARCHER'), ctrl.update);
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.remove);

module.exports = router;
