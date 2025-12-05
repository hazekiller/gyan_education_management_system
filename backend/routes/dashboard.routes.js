const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
// const { requirePermission } = require("../middleware/authorization");
const {
  getRecentRegistrations,
  getDashboardStats,
  getTeacherDashboardStats,
} = require("../controllers/dashboardController");

// All routes require authentication
router.use(authenticate);

// Get dashboard stats
router.get("/stats", getDashboardStats);

// Get teacher-specific dashboard stats
router.get("/teacher-stats/:teacherId", getTeacherDashboardStats);

// Get recent registrations
router.get("/recent-registrations", getRecentRegistrations);

module.exports = router;
