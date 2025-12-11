const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const upload = require("../middleware/upload");

const {
    getAllFrontDeskStaff,
    getFrontDeskStaffById,
    createFrontDeskStaff,
    updateFrontDeskStaff,
    deleteFrontDeskStaff,
    logVisitor,
    getVisitorLogs,
    checkoutVisitor,
    createInquiry,
    getInquiries,
    updateInquiry,
} = require("../controllers/frontdeskController");

router.use(authenticate);

// ==============================
// FRONT DESK STAFF ROUTES
// ==============================

// READ all frontdesk staff
router.get("/", requirePermission("frontdesk", "read"), getAllFrontDeskStaff);

// READ single frontdesk staff
router.get("/:id", requirePermission("frontdesk", "read"), getFrontDeskStaffById);

// CREATE frontdesk staff with image
router.post(
    "/",
    requirePermission("frontdesk", "create"),
    upload.single("profile_photo"),
    createFrontDeskStaff
);

// UPDATE frontdesk staff with image
router.put(
    "/:id",
    requirePermission("frontdesk", "update"),
    upload.single("profile_photo"),
    updateFrontDeskStaff
);

// DELETE frontdesk staff
router.delete("/:id", requirePermission("frontdesk", "delete"), deleteFrontDeskStaff);

// ==============================
// VISITOR MANAGEMENT ROUTES
// ==============================

// Log visitor check-in
router.post("/visitors", requirePermission("staff", "read"), logVisitor);

// Get visitor logs
router.get("/visitors/logs", requirePermission("staff", "read"), getVisitorLogs);

// Checkout visitor
router.put("/visitors/:id/checkout", requirePermission("staff", "read"), checkoutVisitor);

// ==============================
// INQUIRY MANAGEMENT ROUTES
// ==============================

// Create inquiry
router.post("/inquiries", requirePermission("staff", "read"), createInquiry);

// Get inquiries
router.get("/inquiries/list", requirePermission("staff", "read"), getInquiries);

// Update inquiry
router.put("/inquiries/:id", requirePermission("staff", "read"), updateInquiry);

module.exports = router;
