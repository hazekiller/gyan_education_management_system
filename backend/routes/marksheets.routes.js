const express = require("express");
const router = express.Router();
const marksheetController = require("../controllers/marksheetController");
const { authenticate, authorize } = require("../middleware/auth");

// All routes are protected and restricted to admin
router.use(authenticate);
router.use(authorize("admin", "super_admin"));

router
    .route("/")
    .post(marksheetController.createMarksheet)
    .get(marksheetController.getAllMarksheets);

// PDF generation route (must be before /:id to avoid conflicts)
router.post("/:id/generate-pdf", marksheetController.generateMarksheetPDF);

router
    .route("/:id")
    .get(marksheetController.getMarksheetById)
    .put(marksheetController.updateMarksheet)
    .delete(marksheetController.deleteMarksheet);

module.exports = router;
