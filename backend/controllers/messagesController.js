const pool = require("../config/database");
const { createNotification } = require("./notificationsController");

// Get all users for messaging (based on role permissions)
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    let query = `
      SELECT 
        u.id,
        u.email,
        u.role,
        u.is_active,
        u.last_login,
        CASE
          WHEN u.role = 'student' THEN s.first_name
          WHEN u.role = 'teacher' THEN t.first_name
          WHEN u.role IN ('accountant', 'guard', 'cleaner') THEN st.first_name
          ELSE u.email
        END as first_name,
        CASE
          WHEN u.role = 'student' THEN s.last_name
          WHEN u.role = 'teacher' THEN t.last_name
          WHEN u.role IN ('accountant', 'guard', 'cleaner') THEN st.last_name
          ELSE ''
        END as last_name,
        CASE
          WHEN u.role = 'student' THEN s.profile_photo
          WHEN u.role = 'teacher' THEN t.profile_photo
          WHEN u.role IN ('accountant', 'guard', 'cleaner') THEN st.profile_photo
          ELSE NULL
        END as profile_photo,
        CASE
          WHEN u.role = 'student' THEN c.name
          ELSE NULL
        END as class_name
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE u.id != ? AND u.is_active = 1
    `;

    const params = [currentUserId];

    // Role-based filtering
    if (currentUserRole === "student") {
      // Students can message teachers, principal, vice_principal, and other students in their class
      query += ` AND (u.role IN ('teacher', 'principal', 'vice_principal', 'hod') 
                 OR (u.role = 'student' AND s.class_id = (SELECT class_id FROM students WHERE user_id = ?)))`;
      params.push(currentUserId);
    } else if (currentUserRole === "teacher") {
      // Teachers can message students, other teachers, and admins
      query += ` AND u.role IN ('student', 'teacher', 'principal', 'vice_principal', 'hod')`;
    } else if (currentUserRole === "accountant") {
      // Accountants can message students (for fee), teachers, and admins
      query += ` AND u.role IN ('student', 'teacher', 'principal', 'vice_principal', 'accountant')`;
    } else if (
      ["super_admin", "principal", "vice_principal", "hod"].includes(
        currentUserRole
      )
    ) {
      // Admins can message everyone (no additional filter needed)
    } else {
      // Other roles can only message admins and teachers
      query += ` AND u.role IN ('teacher', 'principal', 'vice_principal', 'hod', 'super_admin')`;
    }

    // Search filter
    if (search) {
      query += ` AND (
        s.first_name LIKE ? OR s.last_name LIKE ? OR
        t.first_name LIKE ? OR t.last_name LIKE ? OR
        st.first_name LIKE ? OR st.last_name LIKE ? OR
        u.email LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam
      );
    }

    query += " ORDER BY u.last_login DESC LIMIT 50";

    const [users] = await pool.query(query, params);

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.first_name
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : user.email,
      email: user.email,
      role: user.role,
      profile_photo: user.profile_photo,
      class_name: user.class_name,
      is_online:
        user.last_login &&
        new Date() - new Date(user.last_login) < 5 * 60 * 1000, // Online if logged in within 5 minutes
      last_login: user.last_login,
    }));

    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversations for current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [conversations] = await pool.query(
      `
      SELECT 
        t.user_id,
        t.last_message_time,
        m.message_text as last_message,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = t.user_id AND m2.receiver_id = ? AND m2.is_read = 0) as unread_count
      FROM (
        SELECT 
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as user_id,
          MAX(sent_at) as last_message_time
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY user_id
      ) t
      JOIN messages m ON (
        (m.sender_id = ? AND m.receiver_id = t.user_id) 
        OR (m.sender_id = t.user_id AND m.receiver_id = ?)
      ) AND m.sent_at = t.last_message_time
      ORDER BY t.last_message_time DESC
    `,
      [userId, userId, userId, userId, userId, userId]
    );

    // Get user details for each conversation
    if (conversations.length > 0) {
      const userIds = conversations.map((c) => c.user_id);
      const placeholders = userIds.map(() => "?").join(",");

      const [users] = await pool.query(
        `
        SELECT 
          u.id,
          u.email,
          u.role,
          u.last_login,
          CASE
            WHEN u.role = 'student' THEN s.first_name
            WHEN u.role = 'teacher' THEN t.first_name
            WHEN u.role IN ('accountant', 'guard', 'cleaner') THEN st.first_name
            ELSE u.email
          END as first_name,
          CASE
            WHEN u.role = 'student' THEN s.last_name
            WHEN u.role = 'teacher' THEN t.last_name
            WHEN u.role IN ('accountant', 'guard', 'cleaner') THEN st.last_name
            ELSE ''
          END as last_name,
          CASE
            WHEN u.role = 'student' THEN s.profile_photo
            WHEN u.role = 'teacher' THEN t.profile_photo
            WHEN u.role IN ('accountant', 'guard', 'cleaner') THEN st.profile_photo
            ELSE NULL
          END as profile_photo
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        LEFT JOIN teachers t ON u.id = t.user_id
        LEFT JOIN staff st ON u.id = st.user_id
        WHERE u.id IN (${placeholders})
      `,
        userIds
      );

      // Merge conversation data with user details
      const conversationsWithDetails = conversations.map((conv) => {
        const user = users.find((u) => u.id === conv.user_id);
        return {
          user_id: conv.user_id,
          name: user?.first_name
            ? `${user.first_name} ${user.last_name || ""}`.trim()
            : user?.email || "Unknown",
          email: user?.email,
          role: user?.role,
          profile_photo: user?.profile_photo,
          last_message: conv.last_message,
          last_message_time: conv.last_message_time,
          unread_count: conv.unread_count,
          is_online:
            user?.last_login &&
            new Date() - new Date(user.last_login) < 5 * 60 * 1000,
        };
      });

      res.json({ success: true, data: conversationsWithDetails });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages with a specific user
const getMessagesByUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const [messages] = await pool.query(
      `
      SELECT 
        m.*,
        CASE 
          WHEN m.sender_id = ? THEN 'sent'
          ELSE 'received'
        END as message_type
      FROM messages m
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.sent_at ASC
    `,
      [currentUserId, currentUserId, otherUserId, otherUserId, currentUserId]
    );

    // Mark received messages as read
    await pool.query(
      `
      UPDATE messages 
      SET is_read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `,
      [otherUserId, currentUserId]
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver and content are required",
      });
    }

    // Validate that receiver exists and is active
    const [receivers] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND is_active = 1",
      [receiver_id]
    );

    if (receivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found or inactive",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO messages (sender_id, receiver_id, message_text)
      VALUES (?, ?, ?)
    `,
      [senderId, receiver_id, content]
    );

    const [message] = await pool.query(
      `
      SELECT * FROM messages WHERE id = ?
    `,
      [result.insertId]
    );

    // Emit socket event for real-time delivery
    const io = req.app.get("io");
    if (io) {
      const onlineUsers = io.sockets.adapter.rooms.get(`user_${receiver_id}`);
      if (onlineUsers) {
        io.to(`user_${receiver_id}`).emit("new_message", {
          ...message[0],
          message_type: "received",
        });
      }
    }

    // Create notification
    createNotification(
      req,
      receiver_id,
      "New Message",
      `You have a new message from user ${senderId}`,
      "info",
      `/messages`
    ).catch((err) => console.error("Error sending message notification:", err));

    res.status(201).json({ success: true, data: message[0] });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      `
      UPDATE messages 
      SET is_read = 1 
      WHERE id = ? AND receiver_id = ?
    `,
      [messageId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you are not the receiver",
      });
    }

    res.json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      `
      DELETE FROM messages 
      WHERE id = ? AND sender_id = ?
    `,
      [messageId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you are not the sender",
      });
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.query(
      `
      SELECT COUNT(*) as unread_count 
      FROM messages 
      WHERE receiver_id = ? AND is_read = 0
    `,
      [userId]
    );

    res.json({
      success: true,
      data: { unread_count: result[0].unread_count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getConversations,
  getMessagesByUser,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
};
