const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');

// All routes are protected
router.use(authenticate);
router.use(requireRole(['super_admin', 'accountant', 'founder', 'principal']));

router.get('/stats', accountsController.getDashboardStats);
router.get('/expenses', accountsController.getExpenses);
router.post('/expenses', accountsController.addExpense);
router.patch('/expenses/:id/tally', accountsController.updateTallyReference);

module.exports = router;
