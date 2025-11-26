const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const {
  getExamSchedules,
  getScheduleById,
  createSchedule,
  createMultipleSchedules,
  updateSchedule,
  deleteSchedule,
  deleteExamSchedules,
} = require("../controllers/examScheduleController");

// All routes require authentication
router.use(authenticate);

// Get all schedules for an exam
router.get(
  "/exam/:exam_id",
  requirePermission("exams", "read"),
  getExamSchedules
);

// Get single schedule by ID
router.get("/:id", requirePermission("exams", "read"), getScheduleById);

// Create single schedule
router.post("/", requirePermission("exams", "create"), createSchedule);

// Create multiple schedules at once
router.post(
  "/bulk",
  requirePermission("exams", "create"),
  createMultipleSchedules
);

// Update schedule
router.put("/:id", requirePermission("exams", "update"), updateSchedule);

// Delete single schedule
router.delete("/:id", requirePermission("exams", "delete"), deleteSchedule);

// Delete all schedules for an exam
router.delete(
  "/exam/:exam_id",
  requirePermission("exams", "delete"),
  deleteExamSchedules
);

module.exports = router;
