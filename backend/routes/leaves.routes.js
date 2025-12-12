const express = require("express");
const router = express.Router();
const leavesController = require("../controllers/leavesController");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

// All routes require authentication
router.use(authenticate);

// Get all leave applications (admin view)
router.get("/", leavesController.getAll);

// Get my leave applications
router.get("/my-leaves", leavesController.getMyLeaves);

// Get pending leave count (for admin dashboard)
router.get("/pending-count", leavesController.getPendingCount);

// Get single leave application
router.get("/:id", leavesController.getById);

// Create new leave application (with file upload)
router.post("/", upload.single("supporting_document"), leavesController.create);

// Update leave application
router.put("/:id", leavesController.update);

// Approve leave application
router.patch("/:id/approve", leavesController.approveLeave);

// Decline leave application
router.patch("/:id/decline", leavesController.declineLeave);

// Delete leave application
router.delete("/:id", leavesController.delete);

module.exports = router;
