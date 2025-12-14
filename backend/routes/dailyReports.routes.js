const express = require("express");
const router = express.Router();
const dailyReportsController = require("../controllers/dailyReportsController");
const { authenticate, authorize } = require("../middleware/auth");

// All routes are protected
router.use(authenticate);

// Get all reports (Teachers see their own, Admins see all)
router.get("/", dailyReportsController.getReports);

// Get single report
router.get("/:id", dailyReportsController.getReportById);

// Create report (Teachers can create their own, Admins can create for any teacher)
router.post(
    "/",
    authorize("super_admin", "admin", "principal", "hod", "teacher"),
    dailyReportsController.createReport
);

// Update report (Teachers can update their own, Admins can update any)
router.put(
    "/:id",
    authorize("super_admin", "admin", "principal", "hod", "teacher"),
    dailyReportsController.updateReport
);

// Delete report (Admin, Principal, HOD only)
router.delete(
    "/:id",
    authorize("super_admin", "admin", "principal", "hod"),
    dailyReportsController.deleteReport
);

// Add feedback (Admin, Principal, HOD only)
router.put(
    "/:id/feedback",
    authorize("super_admin", "admin", "principal", "hod"),
    dailyReportsController.addFeedback
);

module.exports = router;
