const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectsController');

// All routes require authentication
router.use(authenticate);

// Get all subjects - requires 'read' permission
router.get('/', requirePermission('subjects', 'read'), getAllSubjects);

// Get subject by ID - requires 'read' permission
router.get('/:id', requirePermission('subjects', 'read'), getSubjectById);

// Create subject - requires 'create' permission
router.post('/', requirePermission('subjects', 'create'), createSubject);

// Update subject - requires 'update' permission
router.put('/:id', requirePermission('subjects', 'update'), updateSubject);

// Delete subject - requires 'delete' permission
router.delete('/:id', requirePermission('subjects', 'delete'), deleteSubject);

module.exports = router;