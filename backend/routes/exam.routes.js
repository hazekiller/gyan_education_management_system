const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const { getAllExams, getExamById, createExam, updateExam, deleteExam } = require("../controllers/examController");

// All routes require authentication
router.use(authenticate);

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

module.exports = router;