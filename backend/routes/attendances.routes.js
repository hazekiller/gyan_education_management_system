const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  requirePermission,
  requireRole,
} = require("../middleware/authorization");
const {
  getAttendance,
  checkSubmissionStatus,
  markAttendance,
  submitAttendance,
  unlockAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
} = require("../controllers/attendanceController");

// All routes require authentication
router.use(authenticate);

// Get attendance records - requires 'read' permission
router.get("/", requirePermission("attendance", "read"), getAttendance);

// Check if attendance is submitted
router.get(
  "/check-submission",
  requirePermission("attendance", "read"),
  checkSubmissionStatus
);

// Get attendance statistics - requires 'read' permission
router.get(
  "/stats",
  requirePermission("attendance", "read"),
  getAttendanceStats
);

// Mark attendance - requires 'create' permission
router.post("/", requirePermission("attendance", "create"), markAttendance);

// Submit attendance (lock it) - requires 'create' permission
router.post(
  "/submit",
  requirePermission("attendance", "create"),
  submitAttendance
);

// Unlock submitted attendance - admin only
router.post(
  "/unlock",
  requireRole(["super_admin", "principal", "vice_principal"]),
  unlockAttendance
);

// Update attendance record - requires 'update' permission
router.put("/:id", requirePermission("attendance", "update"), updateAttendance);

// Delete attendance record - requires 'delete' permission
router.delete(
  "/:id",
  requirePermission("attendance", "delete"),
  deleteAttendance
);

module.exports = router;
