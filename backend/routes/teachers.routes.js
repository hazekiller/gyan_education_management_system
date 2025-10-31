const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const upload = require('../middleware/upload');
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSchedule
} = require('../controllers/teachersController');

// All routes require authentication
router.use(authenticate);

// Get all teachers - requires 'read' permission
router.get('/', requirePermission('teachers', 'read'), getAllTeachers);

// Get teacher by ID - requires 'read' permission
router.get('/:id', requirePermission('teachers', 'read'), getTeacherById);

// Create teacher - requires 'create' permission
router.post(
  '/',
  requirePermission('teachers', 'create'),
  upload.single('profile_photo'),
  createTeacher
);

// Update teacher - requires 'update' permission
router.put(
  '/:id',
  requirePermission('teachers', 'update'),
  upload.single('profile_photo'),
  updateTeacher
);

// Delete teacher - requires 'delete' permission
router.delete('/:id', requirePermission('teachers', 'delete'), deleteTeacher);

// Get teacher's schedule/timetable - requires 'read' permission
router.get('/:id/schedule', requirePermission('teachers', 'read'), getTeacherSchedule);

module.exports = router;