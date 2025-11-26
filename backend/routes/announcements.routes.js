const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const {
  getAllAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  publishAnnouncement,
  getAnnouncementsByClass,
  getAnnouncementsBySection,
  getUrgentAnnouncements,
  getMyCreatedAnnouncements,
} = require("../controllers/announcementsController");

// All routes require authentication
router.use(authenticate);

// ============= ANNOUNCEMENT ROUTES =============

// Get all announcements - requires 'read' permission
router.get("/", requirePermission("announcements", "read"), getAllAnnouncements);

// Get announcements for logged-in user (role-based filtering)
router.get("/my-announcements", getMyAnnouncements);

// Get announcements created by logged-in user
router.get("/my-created", getMyCreatedAnnouncements);

// Get urgent announcements
router.get("/urgent", requirePermission("announcements", "read"), getUrgentAnnouncements);

// Get announcements by class
router.get(
  "/class/:class_id",
  requirePermission("announcements", "read"),
  getAnnouncementsByClass
);

// Get announcements by section
router.get(
  "/section/:section_id",
  requirePermission("announcements", "read"),
  getAnnouncementsBySection
);

// Get announcement by ID - requires 'read' permission
router.get("/:id", requirePermission("announcements", "read"), getAnnouncementById);

// Create announcement - requires 'create' permission
router.post("/", requirePermission("announcements", "create"), createAnnouncement);

// Update announcement - requires 'update' permission
router.put("/:id", requirePermission("announcements", "update"), updateAnnouncement);

// Delete announcement - requires 'delete' permission
router.delete("/:id", requirePermission("announcements", "delete"), deleteAnnouncement);

// Toggle announcement status (activate/deactivate) - requires 'update' permission
router.patch(
  "/:id/toggle-status",
  requirePermission("announcements", "update"),
  toggleAnnouncementStatus
);

// Publish announcement - requires 'update' permission
router.patch(
  "/:id/publish",
  requirePermission("announcements", "update"),
  publishAnnouncement
);

module.exports = router;