const express = require("express");
const router = express.Router();
const admissionsController = require("../controllers/admissionsController");
const { authenticate } = require("../middleware/auth");


// All routes require authentication
router.use(authenticate);

// List admissions
router.get("/", authenticate, admissionsController.getAll);

// Get single admission
router.get(
  "/:id",
  authenticate,
  admissionsController.getById
);

// Create admission
router.post(
  "/",
  authenticate,
  admissionsController.create
);

// Update admission
router.put(
  "/:id",
  authenticate,
  admissionsController.update
);

// Delete admission
router.delete(
  "/:id",
  authenticate,
  admissionsController.delete
);

// Convert to student
router.post(
  "/:id/convert-to-student",
  authenticate,
  admissionsController.convertToStudent
);

module.exports = router;
