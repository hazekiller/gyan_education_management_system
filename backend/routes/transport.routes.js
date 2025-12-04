const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const transportController = require("../controllers/transportController");
const busAttendanceController = require("../controllers/busAttendanceReportsController");

router.use(authenticate);

// Admin Routes (Vehicles)
router.get(
  "/vehicles",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.getAllVehicles
);
router.post(
  "/vehicles",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.createVehicle
);
router.put(
  "/vehicles/:id",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.updateVehicle
);
router.delete(
  "/vehicles/:id",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.deleteVehicle
);

// Admin Routes (Routes & Stops)
router.get(
  "/routes",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.getAllRoutes
);
router.post(
  "/routes",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.createRoute
);
router.put(
  "/routes/:id",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.updateRoute
);
router.delete(
  "/routes/:id",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.deleteRoute
);

// Admin Routes (Allocations)
router.get(
  "/allocations",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.getAllocations
);
router.post(
  "/allocate",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.allocateTransport
);
router.put(
  "/allocations/:id",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.updateAllocation
);
router.delete(
  "/allocations/:id",
  requireRole(["super_admin", "admin", "principal"]),
  transportController.cancelAllocation
);

// Student Routes
router.get(
  "/my-transport",
  requireRole(["student"]),
  transportController.getMyTransport
);

// ==========================================
// BUS ATTENDANCE REPORTS ROUTES
// ==========================================

// Admin Routes - CRUD Operations
router.get(
  "/attendance-reports",
  requireRole(["super_admin", "admin", "principal", "hod"]),
  busAttendanceController.getReports
);

router.get(
  "/attendance-reports/:id",
  requireRole(["super_admin", "admin", "principal", "hod"]),
  busAttendanceController.getReportById
);

router.post(
  "/attendance-reports",
  requireRole(["super_admin", "admin", "principal", "hod"]),
  busAttendanceController.createReport
);

router.put(
  "/attendance-reports/:id",
  requireRole(["super_admin", "admin", "principal", "hod"]),
  busAttendanceController.updateReport
);

router.delete(
  "/attendance-reports/:id",
  requireRole(["super_admin", "admin", "principal"]),
  busAttendanceController.deleteReport
);

// Verify Report (Principal/SuperAdmin only)
router.patch(
  "/attendance-reports/:id/verify",
  requireRole(["super_admin", "principal"]),
  busAttendanceController.verifyReport
);

// Helper - Get students for a route (for creating reports)
router.get(
  "/routes/:route_id/students",
  requireRole(["super_admin", "admin", "principal", "hod"]),
  busAttendanceController.getRouteStudents
);

// Student Route - View their own attendance
router.get(
  "/my-bus-attendance",
  requireRole(["student"]),
  busAttendanceController.getMyAttendance
);

module.exports = router;
