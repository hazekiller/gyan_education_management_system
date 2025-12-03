const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getStudentAllResults,
  getStudentExamResults,
  generateResultPDF,
} = require("../controllers/resultsController");

// All routes require authentication
router.use(authenticate);

// Get all results for a student
router.get("/student/:studentId", getStudentAllResults);

// Get results for a specific exam
router.get("/student/:studentId/exam/:examId", getStudentExamResults);

// Download PDF marksheet
router.get("/student/:studentId/exam/:examId/pdf", generateResultPDF);

module.exports = router;
