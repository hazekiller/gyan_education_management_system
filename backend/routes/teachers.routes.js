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
  deleteTeacher
} = require('../controllers/teachersController');

router.use(authenticate);

// READ
router.get('/', requirePermission('teachers', 'read'), getAllTeachers);

// READ single
router.get('/:id', requirePermission('teachers', 'read'), getTeacherById);

// CREATE with image
router.post(
  '/',
  requirePermission('teachers', 'create'),
  upload.single('profile_photo'),   // 👈 MUST MATCH FRONTEND INPUT NAME
  createTeacher
);

// UPDATE with image
router.put(
  '/:id',
  requirePermission('teachers', 'update'),
  upload.single('profile_photo'),   // 👈 MUST MATCH FRONTEND INPUT NAME
  updateTeacher
);

// DELETE
router.delete('/:id', requirePermission('teachers', 'delete'), deleteTeacher);

module.exports = router;
