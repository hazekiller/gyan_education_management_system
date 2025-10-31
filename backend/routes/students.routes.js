const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const upload = require('../middleware/upload');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentResults
} = require('../controllers/studentsController');

// All routes require authentication
router.use(authenticate);

// Get all students - requires 'read' permission
router.get('/', requirePermission('students', 'read'), getAllStudents);

// Get student by ID - requires 'read' permission
router.get('/:id', requirePermission('students', 'read'), getStudentById);

// Create student - requires 'create' permission
router.post(
  '/',
  requirePermission('students', 'create'),
  upload.single('profile_photo'),
  createStudent
);

// Update student - requires 'update' permission
router.put(
  '/:id',
  requirePermission('students', 'update'),
  upload.single('profile_photo'),
  updateStudent
);

// Delete student - requires 'delete' permission
router.delete('/:id', requirePermission('students', 'delete'), deleteStudent);

// Get student attendance - requires 'read' permission for attendance
router.get(
  '/:id/attendance',
  requirePermission('attendance', 'read'),
  getStudentAttendance
);

// Get student results - requires 'read' permission for exams
router.get(
  '/:id/results',
  requirePermission('exams', 'read'),
  getStudentResults
);

module.exports = router;