const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents
} = require('../controllers/classesController');

// All routes require authentication
router.use(authenticate);

// Get all classes - requires 'read' permission
router.get('/', requirePermission('classes', 'read'), getAllClasses);

// Get class by ID - requires 'read' permission
router.get('/:id', requirePermission('classes', 'read'), getClassById);

// Create class - requires 'create' permission
router.post('/', requirePermission('classes', 'create'), createClass);

// Update class - requires 'update' permission
router.put('/:id', requirePermission('classes', 'update'), updateClass);

// Delete class - requires 'delete' permission
router.delete('/:id', requirePermission('classes', 'delete'), deleteClass);

// Get class students - requires 'read' permission for students
router.get('/:id/students', requirePermission('students', 'read'), getClassStudents);

module.exports = router;