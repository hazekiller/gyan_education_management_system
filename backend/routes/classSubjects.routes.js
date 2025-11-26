const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const {
  getClassSubjects,
  getSectionSubjects,
  assignSubjectToClass,
  assignMultipleSubjectsToClass,
  assignTeacherToSectionSubject,
  updateClassSubject,
  removeSubjectFromClass,
  getAvailableSubjectsForClass
} = require('../controllers/classSubjectsController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/class-subjects/class/:class_id
 * @desc    Get all subjects assigned to a specific class
 * @access  Authenticated users with 'read' permission on class_subjects
 */
router.get(
  '/class/:class_id',
  requirePermission('class_subjects', 'read'),
  getClassSubjects
);

/**
 * @route   GET /api/class-subjects/section/:section_id
 * @desc    Get all subjects for a specific section (includes section-specific teacher assignments)
 * @access  Authenticated users with 'read' permission on class_subjects
 */
router.get(
  '/section/:section_id',
  requirePermission('class_subjects', 'read'),
  getSectionSubjects
);

/**
 * @route   GET /api/class-subjects/available/:class_id
 * @desc    Get subjects that are available to assign to a class (not yet assigned)
 * @access  Authenticated users with 'read' permission on class_subjects
 */
router.get(
  '/available/:class_id',
  requirePermission('class_subjects', 'read'),
  getAvailableSubjectsForClass
);

/**
 * @route   POST /api/class-subjects/assign
 * @desc    Assign a single subject to a class
 * @access  Authenticated users with 'create' permission on class_subjects
 * @body    { class_id, subject_id, teacher_id?, academic_year? }
 */
router.post(
  '/assign',
  requirePermission('class_subjects', 'create'),
  assignSubjectToClass
);

/**
 * @route   POST /api/class-subjects/assign-multiple
 * @desc    Assign multiple subjects to a class at once
 * @access  Authenticated users with 'create' permission on class_subjects
 * @body    { class_id, subjects: [{ subject_id, teacher_id? }], academic_year? }
 */
router.post(
  '/assign-multiple',
  requirePermission('class_subjects', 'create'),
  assignMultipleSubjectsToClass
);

/**
 * @route   POST /api/class-subjects/section-teacher
 * @desc    Assign a teacher to a specific section-subject combination
 * @access  Authenticated users with 'create' permission on class_subjects
 * @body    { section_id, subject_id, teacher_id, academic_year? }
 */
router.post(
  '/section-teacher',
  requirePermission('class_subjects', 'create'),
  assignTeacherToSectionSubject
);

/**
 * @route   PUT /api/class-subjects/:id
 * @desc    Update a class subject assignment (e.g., change teacher or status)
 * @access  Authenticated users with 'update' permission on class_subjects
 * @body    { teacher_id?, is_active?, academic_year? }
 */
router.put(
  '/:id',
  requirePermission('class_subjects', 'update'),
  updateClassSubject
);

/**
 * @route   DELETE /api/class-subjects/:id
 * @desc    Remove a subject from a class
 * @access  Authenticated users with 'delete' permission on class_subjects
 */
router.delete(
  '/:id',
  requirePermission('class_subjects', 'delete'),
  removeSubjectFromClass
);

module.exports = router;