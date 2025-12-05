const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorization");
const upload = require("../middleware/upload");
const {
  getFiles,
  uploadFile,
  createFolder,
  updateItem,
  deleteItem,
  downloadFile,
} = require("../controllers/subjectFilesController");

// All routes require authentication
router.use(authenticate);

// Get files/folders for a subject
router.get("/", requirePermission("subjects", "read"), getFiles);

// Upload file
router.post(
  "/upload",
  requirePermission("subjects", "create"),
  upload.single("file"),
  uploadFile
);

// Create folder
router.post("/folder", requirePermission("subjects", "create"), createFolder);

// Update file/folder name or description
router.put("/:id", requirePermission("subjects", "update"), updateItem);

// Delete file/folder
router.delete("/:id", requirePermission("subjects", "delete"), deleteItem);

// Download file
router.get(
  "/:id/download",
  requirePermission("subjects", "read"),
  downloadFile
);

module.exports = router;
