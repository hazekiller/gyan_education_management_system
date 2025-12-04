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

// Create report (Admin, Principal, HOD only)
router.post(
    "/",
    authorize("super_admin", "admin", "principal", "hod"),
    dailyReportsController.createReport
);

// Update report (Admin, Principal, HOD only)
router.put(
    "/:id",
    authorize("super_admin", "admin", "principal", "hod"),
    dailyReportsController.updateReport
);

// Delete report (Admin, Principal, HOD only)
router.delete(
    "/:id",
    authorize("super_admin", "admin", "principal", "hod"),
    dailyReportsController.deleteReport
);

module.exports = router;
