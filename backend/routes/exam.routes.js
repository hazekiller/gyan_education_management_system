const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");

const {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getAcademicYears,
} = require("../controllers/examController");

const {
  getExamResults,
  getStudentResults,
  enterResults,
  updateResult,
  deleteResult,
} = require("../controllers/examResultsController");

// All routes require authentication
router.use(authenticate);

// Get distinct academic years
router.get("/academic-years", getAcademicYears);

// Get all exams - requires 'read' permission
router.get("/", requirePermission("exams", "read"), getAllExams);

// Get exam by ID - requires 'read' permission
router.get("/:id", requirePermission("exams", "read"), getExamById);

// Create exam - requires 'create' permission
router.post("/", requirePermission("exams", "create"), createExam);

// Update exam - requires 'update' permission
router.put("/:id", requirePermission("exams", "update"), updateExam);

// Delete exam - requires 'delete' permission
router.delete("/:id", requirePermission("exams", "delete"), deleteExam);

// ==========================================
// EXAM RESULTS ROUTES
// ==========================================

// Get all results for an exam (optionally filter by subject)
router.get("/:id/results", requirePermission("exams", "read"), getExamResults);

// Get student's results for an exam
router.get(
  "/:examId/students/:studentId/results",
  requirePermission("exams", "read"),
  getStudentResults
);

// Bulk enter/update results for an exam
router.post("/:id/results", requirePermission("exams", "update"), enterResults);

// Update single result
router.put("/results/:id", requirePermission("exams", "update"), updateResult);

// Delete result
router.delete(
  "/results/:id",
  requirePermission("exams", "delete"),
  deleteResult
);

module.exports = router;
