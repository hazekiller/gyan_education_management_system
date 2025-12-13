const express = require("express");
const router = express.Router();

// ===== Middleware =====
const { authenticate } = require("../middleware/auth");

// ===== Route Imports =====
const authRoutes = require("./auth.routes");
const studentsRoutes = require("./students.routes");
const teachersRoutes = require("./teachers.routes");
const staffRoutes = require("./staff.routes");
const classesRoutes = require("./classes.routes");
const subjectsRoutes = require("./subjects.routes");
const subjectFilesRoutes = require("./subjectFiles.routes");
const attendancesRoutes = require("./attendances.routes");
const assignmentsRoutes = require("./assignments.routes");
const messagesRoutes = require("./messages.routes");
const dashboardRoutes = require("./dashboard.routes");
const classSubjectsRoutes = require("./classSubjects.routes");
const examRoutes = require("./exam.routes");
const announcementsRoutes = require("./announcements.routes");
const examSchedulesRoutes = require("./examschedule.routes");
const eventsRoutes = require("./events.routes");
const feesRoutes = require("./fees.routes");
const libraryRoutes = require("./library.routes");
const admissionsRoutes = require("./admissions.routes");
const dailyReportsRoutes = require("./dailyReports.routes");
const studentReportsRoutes = require("./studentReports.routes");
const timetableRoutes = require("./timetable.routes");
const frontdeskRoutes = require("./frontdesk.routes");
const leavesRoutes = require("./leaves.routes");
const filesRoutes = require("./files.routes");
const disciplineRoutes = require("./discipline.routes");


// ===== PUBLIC ROUTES =====
router.use("/auth", authRoutes);

// ===== PROTECTED ROUTES (Require Login) =====
router.use(authenticate);

router.use("/students", studentsRoutes);
router.use("/students", studentReportsRoutes);
router.use("/teachers", teachersRoutes);
router.use("/staff", staffRoutes);
router.use("/classes", classesRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/subject-files", subjectFilesRoutes);
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
router.use("/admissions", admissionsRoutes);
router.use("/hostel", require("./hostel.routes"));
router.use("/transport", require("./transport.routes"));
router.use("/payroll", require("./payroll.routes"));
router.use("/notifications", require("./notifications.routes"));
router.use("/results", require("./results.routes"));
router.use("/blogs", require("./blog.routes"));
router.use("/daily-reports", dailyReportsRoutes);
router.use("/timetable", timetableRoutes);
router.use("/frontdesk", frontdeskRoutes);
router.use("/leaves", leavesRoutes);
router.use("/files", filesRoutes);
router.use("/discipline", disciplineRoutes);
router.use("/marksheets", require("./marksheets.routes"));

// ===== DEFAULT ROUTE =====
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Gyan School Management System API 🚀",
  });
});

module.exports = router;
