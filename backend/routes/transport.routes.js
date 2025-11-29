const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const transportController = require("../controllers/transportController");

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

module.exports = router;
