const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const {
  getAllClasses,
  getMyClasses,
  getMySections,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  assignClassTeacher,
  removeClassTeacher,
  getClassSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  assignSectionTeacher,
  removeSectionTeacher,
  getSectionStudents,
  getSectionSubjectTeachers,
  assignSectionSubjectTeacher,
  updateSectionSubjectTeacher,
  removeSectionSubjectTeacher,
} = require("../controllers/classesController");

// All routes require authentication
router.use(authenticate);

// ============= CLASS ROUTES =============

// Get all classes - requires 'read' permission
router.get("/", requirePermission("classes", "read"), getAllClasses);

// Get classes assigned to logged-in user (role-based)
router.get("/my-classes", authenticate, getMyClasses);

// Get sections assigned to logged-in user for a specific class (role-based)
router.get("/:id/my-sections", authenticate, getMySections);

// Get sections for a class
router.get(
  "/:id/sections",
  requirePermission("classes", "read"),
  getClassSections
);

// Get class by ID - requires 'read' permission
router.get("/:id", requirePermission("classes", "read"), getClassById);

// Create class - requires 'create' permission
router.post("/", requirePermission("classes", "create"), createClass);

// Update class - requires 'update' permission
router.put("/:id", requirePermission("classes", "update"), updateClass);

// Delete class - requires 'delete' permission
router.delete("/:id", requirePermission("classes", "delete"), deleteClass);

// Get class students - requires 'read' permission for students
router.get(
  "/:id/students",
  requirePermission("students", "read"),
  getClassStudents
);

// Assign class teacher - requires 'update' permission
router.put(
  "/:id/assign-teacher",
  requirePermission("classes", "update"),
  assignClassTeacher
);

// Remove class teacher - requires 'update' permission
router.delete(
  "/:id/remove-teacher",
  requirePermission("classes", "update"),
  removeClassTeacher
);

// ============= SECTION ROUTES =============

// Create section for a class - requires 'create' permission
router.post(
  "/:class_id/sections",
  requirePermission("classes", "create"),
  createSection
);

// Get section by ID - requires 'read' permission
router.get(
  "/sections/:section_id",
  requirePermission("classes", "read"),
  getSectionById
);

// Update section - requires 'update' permission
router.put(
  "/sections/:section_id",
  requirePermission("classes", "update"),
  updateSection
);

// Delete section - requires 'delete' permission
router.delete(
  "/sections/:section_id",
  requirePermission("classes", "delete"),
  deleteSection
);

// Assign section class teacher (homeroom teacher) - requires 'update' permission
router.put(
  "/sections/:section_id/assign-teacher",
  requirePermission("classes", "update"),
  assignSectionTeacher
);

// Remove section class teacher - requires 'update' permission
router.delete(
  "/sections/:section_id/remove-teacher",
  requirePermission("classes", "update"),
  removeSectionTeacher
);

// Get section students - requires 'read' permission for students
router.get(
  "/sections/:section_id/students",
  requirePermission("students", "read"),
  getSectionStudents
);

// ============= SECTION SUBJECT TEACHER ROUTES =============

// Get all subject teachers for a section
router.get(
  "/sections/:section_id/subject-teachers",
  requirePermission("classes", "read"),
  getSectionSubjectTeachers
);

// Assign subject teacher to section
router.post(
  "/sections/:section_id/subject-teachers",
  requirePermission("classes", "update"),
  assignSectionSubjectTeacher
);

// Update section subject teacher assignment
router.put(
  "/section-subject-teachers/:assignment_id",
  requirePermission("classes", "update"),
  updateSectionSubjectTeacher
);

// Remove subject teacher from section
router.delete(
  "/section-subject-teachers/:assignment_id",
  requirePermission("classes", "update"),
  removeSectionSubjectTeacher
);

module.exports = router;
