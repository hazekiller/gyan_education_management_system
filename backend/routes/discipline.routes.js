const express = require("express");
const router = express.Router();
const disciplineController = require("../controllers/disciplineController");
const { authorize } = require("../middleware/auth");

// Routes
// Apply authorization: Only Admin, Teacher (maybe), SuperAdmin can access
// For now, let's allow 'admin' and 'super_admin' to manage, others to view maybe?
// User requirement: "display on only admin Admin Sidebar" suggests mainly admin feature.
// But teachers might report. Let's assume admins and teachers can create, but only admins can delete/resolve?
// For simplicity and matching the request ("only admin Admin Sidebar"), we'll restrict to admin/super_admin for now, or maybe teachers can Create.
// Let's stick to standard RBAC.

router.get(
    "/",
    authorize("admin", "super_admin", "teacher", "principal"),
    disciplineController.getAllDisciplineRecords
);

router.get(
    "/:id",
    authorize("admin", "super_admin", "teacher", "principal"),
    disciplineController.getDisciplineRecordById
);

router.post(
    "/",
    authorize("admin", "super_admin", "teacher", "principal"),
    disciplineController.createDisciplineRecord
);

router.put(
    "/:id",
    authorize("admin", "super_admin", "principal"),
    disciplineController.updateDisciplineRecord
);

router.delete(
    "/:id",
    authorize("admin", "super_admin", "principal"),
    disciplineController.deleteDisciplineRecord
);

module.exports = router;
