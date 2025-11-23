const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  assignClassTeacher,
  removeClassTeacher,
  createSection,
  updateSection,
  deleteSection,
  assignSectionTeacher,
  getClassSections,
  getSectionStudents,
} = require("../controllers/classesController");

// All routes require authentication
router.use(authenticate);

// ============= CLASS ROUTES =============

// Get all classes - requires 'read' permission
router.get("/", requirePermission("classes", "read"), getAllClasses);

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

// Assign section teacher - requires 'update' permission
router.put(
  "/sections/:section_id/assign-teacher",
  requirePermission("classes", "update"),
  assignSectionTeacher
);

// Get section students - requires 'read' permission for students
router.get(
  "/sections/:section_id/students",
  requirePermission("students", "read"),
  getSectionStudents
);

module.exports = router;
