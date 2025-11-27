const express = require("express");
const router = express.Router();

// ===== Middleware =====
const { authenticate } = require("../middleware/auth");

// ===== Route Imports =====
const authRoutes = require('./auth.routes');
const studentsRoutes = require('./students.routes');
const teachersRoutes = require('./teachers.routes');
const classesRoutes = require('./classes.routes');
const subjectsRoutes = require('./subjects.routes');
const attendancesRoutes = require('./attendances.routes');
const assignmentsRoutes = require('./assignments.routes');
const messagesRoutes = require('./messages.routes');
const dashboardRoutes = require("./dashboard.routes");
const classSubjectsRoutes = require("./classSubjects.routes");
const examRoutes = require("./exam.routes");
const announcementsRoutes = require("./announcements.routes");
const examSchedulesRoutes = require("./examschedule.routes");
const eventsRoutes = require("./events.routes");
const feesRoutes = require("./fees.routes");
const libraryRoutes = require("./library.routes");

// ===== PUBLIC ROUTES =====
router.use("/auth", authRoutes);

// ===== PROTECTED ROUTES (Require Login) =====
router.use(authenticate);

router.use("/students", studentsRoutes);
router.use("/teachers", teachersRoutes);
router.use("/classes", classesRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/attendance", attendancesRoutes);
router.use("/assignments", assignmentsRoutes);
router.use("/messages", messagesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/class-subjects", classSubjectsRoutes);
router.use("/exams", examRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/exam-schedules", examSchedulesRoutes);
router.use("/events", eventsRoutes);
router.use("/fees", feesRoutes);
router.use("/library", libraryRoutes);

// ===== DEFAULT ROUTE =====
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Gyan School Management System API 🚀",
  });
});

module.exports = router;
