const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationsController");

router.use(authenticate);

router.get("/", getUserNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markAsRead);
router.put("/mark-all-read", markAllAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
