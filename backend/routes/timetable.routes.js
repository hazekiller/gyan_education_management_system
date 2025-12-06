const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} = require("../controllers/timetableController");

router.use(authenticate);

// READ - All authenticated users can read timetable (filtered by their role/permissions in controller if needed, but generally public within school)
router.get("/", getTimetable);

// CREATE - Admin/Principal/HOD/Scheduler
router.post(
  "/",
  requirePermission("classes", "update"), // Using class update permission as proxy for scheduling
  createTimetableEntry
);

// UPDATE
router.put(
  "/:id",
  requirePermission("classes", "update"),
  updateTimetableEntry
);

// DELETE
router.delete(
  "/:id",
  requirePermission("classes", "update"),
  deleteTimetableEntry
);

module.exports = router;
