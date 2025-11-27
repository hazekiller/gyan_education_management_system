const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const upload = require("../middleware/upload");

const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSchedule,
  getScheduleDetail,
  assignSchedule,
} = require("../controllers/teachersController");

router.use(authenticate);

// READ
router.get("/", requirePermission("teachers", "read"), getAllTeachers);

// READ single
router.get("/:id", requirePermission("teachers", "read"), getTeacherById);

// TEACHER SCHEDULE
router.get(
  "/:id/schedule",
  requirePermission("teachers", "read"),
  getTeacherSchedule
);
router.get(
  "/schedule/:periodId",
  requirePermission("teachers", "read"),
  getScheduleDetail
);
router.post(
  "/schedule",
  requirePermission("teachers", "update"),
  assignSchedule
);

// CREATE with image
router.post(
  "/",
  requirePermission("teachers", "create"),
  upload.single("profile_photo"),
  createTeacher
);

// UPDATE with image
router.put(
  "/:id",
  requirePermission("teachers", "update"),
  upload.single("profile_photo"),
  updateTeacher
);

// DELETE
router.delete("/:id", requirePermission("teachers", "delete"), deleteTeacher);

module.exports = router;
