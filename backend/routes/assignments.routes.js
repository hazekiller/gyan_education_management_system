const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const upload = require("../middleware/upload");
const {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentsController");
const {
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  updateSubmission,
} = require("../controllers/assignmentSubmissionsController");

// All routes require authentication
router.use(authenticate);

// Get all assignments - requires 'read' permission
router.get("/", requirePermission("assignments", "read"), getAllAssignments);

// Get assignment by ID - requires 'read' permission
router.get("/:id", requirePermission("assignments", "read"), getAssignmentById);

// Create assignment - requires 'create' permission
// Allows multiple file uploads using 'attachments' field name
router.post(
  "/",
  requirePermission("assignments", "create"),
  upload.array("attachments", 5), // Max 5 files
  createAssignment
);

// Update assignment - requires 'update' permission
router.put(
  "/:id",
  requirePermission("assignments", "update"),
  upload.array("attachments", 5), // Max 5 files
  updateAssignment
);

// Delete assignment - requires 'delete' permission
router.delete(
  "/:id",
  requirePermission("assignments", "delete"),
  deleteAssignment
);

// ==========================================
// SUBMISSION ROUTES
// ==========================================

// Submit assignment (Student)
router.post("/:id/submit", upload.array("attachments", 5), submitAssignment);

// Get all submissions for an assignment (Teacher/Admin)
router.get(
  "/:id/submissions",
  requirePermission("assignments", "read"),
  getSubmissions
);

// Get student's own submission
router.get("/:id/my-submission", getMySubmission);

// Grade a submission (Teacher/Admin)
router.put(
  "/submissions/:id/grade",
  requirePermission("assignments", "update"),
  gradeSubmission
);

// Update submission (Student)
router.put(
  "/submissions/:id",
  upload.array("attachments", 5),
  updateSubmission
);

module.exports = router;
