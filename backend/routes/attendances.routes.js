const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

// All routes require authentication
router.use(authenticate);

// Get attendance records - requires 'read' permission
router.get('/', requirePermission('attendance', 'read'), getAttendance);

// Get attendance statistics - requires 'read' permission
router.get('/stats', requirePermission('attendance', 'read'), getAttendanceStats);

// Mark attendance - requires 'create' permission
router.post('/', requirePermission('attendance', 'create'), markAttendance);

// Update attendance record - requires 'update' permission
router.put('/:id', requirePermission('attendance', 'update'), updateAttendance);

// Delete attendance record - requires 'delete' permission
router.delete('/:id', requirePermission('attendance', 'delete'), deleteAttendance);

module.exports = router;