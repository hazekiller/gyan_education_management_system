const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
// const { requirePermission } = require("../middleware/authorization");
const {
  getRecentRegistrations,
  getDashboardStats,
} = require("../controllers/dashboardController");

// All routes require authentication
router.use(authenticate);

// Get dashboard stats
router.get("/stats", getDashboardStats);

// Get recent registrations
router.get("/recent-registrations", getRecentRegistrations);

module.exports = router;
