const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const upload = require("../middleware/upload");

const {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
} = require("../controllers/staffController");

router.use(authenticate);

// READ
router.get("/", requirePermission("staff", "read"), getAllStaff);

// READ single
router.get("/:id", requirePermission("staff", "read"), getStaffById);

// CREATE with image
router.post(
    "/",
    requirePermission("staff", "create"),
    upload.single("profile_photo"),
    createStaff
);

// UPDATE with image
router.put(
    "/:id",
    requirePermission("staff", "update"),
    upload.single("profile_photo"),
    updateStaff
);

// DELETE
router.delete("/:id", requirePermission("staff", "delete"), deleteStaff);

module.exports = router;
