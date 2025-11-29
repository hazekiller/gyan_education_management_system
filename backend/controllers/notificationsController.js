const pool = require("../config/database");

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly } = req.query;

    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
    `;
    const params = [userId];

    if (unreadOnly === "true") {
      query += " AND is_read = 0";
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [notifications] = await pool.query(query, params);

    // Get unread count
    const [countResult] = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );

    res.json({
      success: true,
      data: notifications,
      unreadCount: countResult[0].count,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const [result] = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );

    res.json({
      success: true,
      count: result[0].count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0",
      [userId]
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query("DELETE FROM notifications WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// Helper to create notification (internal use)
const createNotification = async (
  req,
  userId,
  title,
  message,
  type = "info",
  link = null
) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)",
      [userId, title, message, type, link]
    );

    const notification = {
      id: result.insertId,
      user_id: userId,
      title,
      message,
      type,
      link,
      is_read: 0,
      created_at: new Date(),
    };

    // Emit socket event if io instance is available
    const io = req.app.get("io");
    if (io) {
      // We need to find the socket ID for this user
      // In server.js, onlineUsers map is defined but not exported.
      // However, we can emit to a room if we join users to their own room on connection
      // Or we can broadcast to all and let client filter (not secure/efficient)
      // Best approach: In server.js, we should join users to a room named `user_${userId}`

      // Assuming we update server.js to join users to `user_${userId}` room
      io.to(`user_${userId}`).emit("new_notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    // Don't throw, just log error so main flow doesn't break
    return null;
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
