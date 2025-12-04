// File: backend/services/classNotificationScheduler.js
const cron = require("node-cron");
const pool = require("../config/database");

let io = null;

/**
 * Initialize the class notification scheduler
 * @param {Object} socketIO - Socket.IO instance
 */
const initializeScheduler = (socketIO) => {
  io = socketIO;

  // Run every minute to check for upcoming classes
  cron.schedule("* * * * *", async () => {
    try {
      await checkUpcomingClasses();
    } catch (error) {
      console.error("❌ Class notification scheduler error:", error);
    }
  });

  console.log(
    "✅ Class notification scheduler initialized (runs every minute)"
  );
};

/**
 * Check for classes starting in 10 minutes and send notifications
 */
const checkUpcomingClasses = async () => {
  try {
    // Get current time and day
    const now = new Date();

    // Calculate target time (10 minutes from now)
    const targetTime = new Date(now.getTime() + 10 * 60000);

    // Format time as HH:MM:SS for comparison
    const targetTimeStr = targetTime.toTimeString().slice(0, 8);

    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const dayIndex = now.getDay();
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = daysOfWeek[dayIndex];

    console.log(
      `🔍 Checking for classes at ${targetTimeStr} on ${currentDay}...`
    );

    // Query for classes starting in 10 minutes
    // We check for classes within a 1-minute window to account for scheduler timing
    const query = `
      SELECT 
        tt.id as timetable_id,
        tt.start_time,
        tt.end_time,
        tt.room_number,
        tt.teacher_id,
        t.user_id,
        t.first_name,
        t.last_name,
        c.name as class_name,
        c.grade_level,
        sec.name as section_name,
        sub.name as subject_name,
        sub.code as subject_code
      FROM timetable tt
      INNER JOIN teachers t ON tt.teacher_id = t.id
      INNER JOIN classes c ON tt.class_id = c.id
      INNER JOIN sections sec ON tt.section_id = sec.id
      INNER JOIN subjects sub ON tt.subject_id = sub.id
      WHERE tt.day_of_week = ?
        AND tt.is_active = 1
        AND t.user_id IS NOT NULL
        AND t.status = 'active'
        AND TIME(tt.start_time) BETWEEN 
          TIME_FORMAT(SEC_TO_TIME(TIME_TO_SEC(?) - 30), '%H:%i:%s') 
          AND TIME_FORMAT(SEC_TO_TIME(TIME_TO_SEC(?) + 30), '%H:%i:%s')
    `;

    const [upcomingClasses] = await pool.query(query, [
      currentDay,
      targetTimeStr,
      targetTimeStr,
    ]);

    if (upcomingClasses.length > 0) {
      console.log(`📚 Found ${upcomingClasses.length} upcoming class(es)`);

      // Send notification for each class
      for (const classInfo of upcomingClasses) {
        await sendClassNotification(classInfo);
      }
    }
  } catch (error) {
    console.error("Error checking upcoming classes:", error);
    throw error;
  }
};

/**
 * Send notification to teacher about upcoming class
 * @param {Object} classInfo - Class information from database
 */
const sendClassNotification = async (classInfo) => {
  try {
    const {
      user_id,
      first_name,
      last_name,
      class_name,
      grade_level,
      section_name,
      subject_name,
      start_time,
      end_time,
      room_number,
    } = classInfo;

    // Format time for display (HH:MM)
    const startTimeFormatted = start_time.slice(0, 5);
    const endTimeFormatted = end_time.slice(0, 5);

    // Create notification title and message
    const title = `Upcoming Class: ${subject_name}`;
    const message = `Your ${subject_name} class for ${class_name} - ${section_name} starts in 10 minutes at ${startTimeFormatted}${
      room_number ? ` in Room ${room_number}` : ""
    }.`;
    const link = "/schedule";

    // Check if notification was already sent (to avoid duplicates)
    // We check for notifications created in the last 5 minutes for this specific class
    const [existingNotifications] = await pool.query(
      `SELECT id FROM notifications 
       WHERE user_id = ? 
         AND title = ? 
         AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
       LIMIT 1`,
      [user_id, title]
    );

    if (existingNotifications.length > 0) {
      console.log(
        `⏭️  Notification already sent to ${first_name} ${last_name} for ${subject_name}`
      );
      return;
    }

    // Insert notification into database
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)",
      [user_id, title, message, "info", link]
    );

    const notification = {
      id: result.insertId,
      user_id,
      title,
      message,
      type: "info",
      link,
      is_read: 0,
      created_at: new Date(),
    };

    // Emit real-time notification via Socket.IO
    if (io) {
      const roomName = `user_${user_id}`;
      io.to(roomName).emit("new_notification", notification);
      console.log(
        `✅ Notification sent to ${first_name} ${last_name}: ${subject_name} at ${startTimeFormatted}`
      );
    } else {
      console.warn("⚠️  Socket.IO instance not available");
    }
  } catch (error) {
    console.error("Error sending class notification:", error);
    // Don't throw - continue with other notifications
  }
};

/**
 * Test function to check query logic (for debugging)
 */
const testQuery = async () => {
  try {
    console.log("🧪 Testing class notification query...");
    await checkUpcomingClasses();
    console.log("✅ Test completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
};

module.exports = {
  initializeScheduler,
  checkUpcomingClasses,
  testQuery,
};
