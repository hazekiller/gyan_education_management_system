const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');

// All routes are protected
router.use(authenticate);
router.use(requireRole(['super_admin', 'hr', 'founder', 'principal']));

router.get('/stats', hrController.getDashboardStats);

module.exports = router;
