const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const {
  getAllEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  getUpcomingEvents,
  getTodayEvents,
  getHolidays,
  getEventsByType,
  getEventsByDateRange,
  getMyCreatedEvents,
  getCalendarEvents,
} = require("../controllers/eventsController");

// All routes require authentication
router.use(authenticate);

// ============= EVENT ROUTES =============

// Get all events - requires 'read' permission
router.get("/", requirePermission("events", "read"), getAllEvents);

// Get events for logged-in user (role-based filtering)
router.get("/my-events", getMyEvents);

// Get events created by logged-in user
router.get("/my-created", getMyCreatedEvents);

// Get upcoming events
router.get("/upcoming", requirePermission("events", "read"), getUpcomingEvents);

// Get today's events
router.get("/today", requirePermission("events", "read"), getTodayEvents);

// Get holidays
router.get("/holidays", requirePermission("events", "read"), getHolidays);

// Get calendar events (by month/year)
router.get("/calendar", requirePermission("events", "read"), getCalendarEvents);

// Get events by date range
router.get("/date-range", requirePermission("events", "read"), getEventsByDateRange);

// Get events by type
router.get("/type/:event_type", requirePermission("events", "read"), getEventsByType);

// Get event by ID - requires 'read' permission
router.get("/:id", requirePermission("events", "read"), getEventById);

// Create event - requires 'create' permission
router.post("/", requirePermission("events", "create"), createEvent);

// Update event - requires 'update' permission
router.put("/:id", requirePermission("events", "update"), updateEvent);

// Delete event - requires 'delete' permission
router.delete("/:id", requirePermission("events", "delete"), deleteEvent);

// Toggle event status (activate/deactivate) - requires 'update' permission
router.patch(
  "/:id/toggle-status",
  requirePermission("events", "update"),
  toggleEventStatus
);

module.exports = router;