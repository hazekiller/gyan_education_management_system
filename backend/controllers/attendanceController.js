const pool = require("../config/database");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

// Get attendance records with submission status
const getAttendance = async (req, res) => {
  try {
    const {
      class_id,
      section_id,
      subject_id,
      student_id,
      date,
      start_date,
      end_date,
    } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = `
      SELECT 
        a.*,
        s.first_name,
        s.last_name,
        s.roll_number,
        c.name as class_name,
        sec.name as section_name,
        sub.name as subject_name,
        u.email as marked_by_email,
        sub_user.email as submitted_by_email
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      LEFT JOIN subjects sub ON a.subject_id = sub.id
      LEFT JOIN users u ON a.marked_by = u.id
      LEFT JOIN users sub_user ON a.submitted_by = sub_user.id
      WHERE 1=1
    `;

    const params = [];

    // Role-based filtering
    if (userRole === "teacher") {
      // Teachers can only see their assigned classes
      query += ` AND EXISTS (
        SELECT 1 FROM sections sect 
        WHERE sect.id = s.section_id 
        AND sect.class_teacher_id = (
          SELECT id FROM teachers WHERE user_id = ?
        )
      )`;
      params.push(userId);
    } else if (userRole === "student") {
      // Students can only see their own attendance
      query += ` AND s.user_id = ?`;
      params.push(userId);
    }

    if (class_id) {
      query += " AND a.class_id = ?";
      params.push(class_id);
    }

    if (section_id) {
      query += " AND a.section_id = ?";
      params.push(section_id);
    }

    if (subject_id) {
      query += " AND a.subject_id = ?";
      params.push(subject_id);
    }

    if (student_id) {
      query += " AND a.student_id = ?";
      params.push(student_id);
    }

    if (date) {
      query += " AND a.date = ?";
      params.push(date);
    } else {
      if (start_date) {
        query += " AND a.date >= ?";
        params.push(start_date);
      }
      if (end_date) {
        query += " AND a.date <= ?";
        params.push(end_date);
      }
    }

    query += " ORDER BY a.date DESC, s.roll_number";

    const [attendance] = await pool.query(query, params);

    res.json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

// Check if attendance is already submitted
const checkSubmissionStatus = async (req, res) => {
  try {
    const { class_id, section_id, subject_id, date } = req.query;

    if (!class_id || !section_id || !date) {
      return res.status(400).json({
        success: false,
        message: "class_id, section_id, and date are required",
      });
    }

    let query = `SELECT is_submitted, submitted_at, submitted_by, 
              u.email as submitted_by_email
       FROM attendance a
       LEFT JOIN users u ON a.submitted_by = u.id
       WHERE a.class_id = ? AND a.section_id = ? AND a.date = ?`;

    const params = [class_id, section_id, date];

    if (subject_id) {
      query += " AND a.subject_id = ?";
      params.push(subject_id);
    } else {
      query += " AND a.subject_id IS NULL";
    }

    query += " LIMIT 1";

    const [result] = await pool.query(query, params);

    res.json({
      success: true,
      data: result[0] || { is_submitted: false },
    });
  } catch (error) {
    console.error("Check submission status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check submission status",
      error: error.message,
    });
  }
};

// Mark attendance for students (create or update)
const markAttendance = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { date, attendance_records, subject_id } = req.body;
    const marked_by = req.user.id;
    const userRole = req.user.role;

    if (
      !date ||
      !attendance_records ||
      !Array.isArray(attendance_records) ||
      attendance_records.length === 0
    ) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Date and attendance records array are required",
      });
    }

    if (!subject_id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Subject ID is required for marking attendance",
      });
    }

    const firstRecord = attendance_records[0];
    const { class_id, section_id } = firstRecord;

    // ---------------------------------------------------------
    // SCHEDULE VALIDATION
    // ---------------------------------------------------------
    if (userRole === "teacher") {
      // 1. Get the day of the week for the given date
      const dayOfWeek = dayjs(date).format("dddd"); // e.g., "Monday"

      // 2. Check if there is a schedule for this teacher, class, section, subject on this day
      // Note: We are checking if the SUBJECT is scheduled for this class/section on this day.
      // We also check if the current time is within the schedule time.

      const currentTime = dayjs().format("HH:mm:00");

      // If marking for a past/future date, strict time validation might be tricky.
      // Requirement: "teacher can mark the attendance only on the assigned time"
      // This usually implies "right now". If they are marking for "today", check time.
      // If they are marking for past dates, maybe we should allow it?
      // But the requirement says "only on the assigned time".
      // Let's assume strict mode: You can only mark attendance during the class time.

      const isToday = dayjs(date).isSame(dayjs(), "day");

      if (isToday) {
        const [schedule] = await connection.query(
          `SELECT start_time, end_time FROM timetable 
           WHERE class_id = ? AND section_id = ? AND subject_id = ? AND day_of_week = ?`,
          [class_id, section_id, subject_id, dayOfWeek]
        );

        if (schedule.length === 0) {
          await connection.rollback();
          return res.status(403).json({
            success: false,
            message: `No schedule found for this subject on ${dayOfWeek}`,
          });
        }

        // Check if current time is within any of the scheduled slots
        const isWithinTime = schedule.some((slot) => {
          const start = dayjs(slot.start_time, "HH:mm:ss");
          const end = dayjs(slot.end_time, "HH:mm:ss");
          const now = dayjs();
          // We need to compare only times.
          const nowTime = dayjs(now.format("HH:mm:ss"), "HH:mm:ss");

          console.log("Debug Attendance Time Check:");
          console.log("Slot Start:", start.format("HH:mm:ss"));
          console.log("Slot End:", end.format("HH:mm:ss"));
          console.log("Server Now:", nowTime.format("HH:mm:ss"));
          console.log("Is Between:", nowTime.isBetween(start, end, null, "[]"));

          // Inclusive check: start <= now <= end
          return nowTime.isBetween(start, end, null, "[]");
        });

        if (!isWithinTime) {
          await connection.rollback();
          return res.status(403).json({
            success: false,
            message:
              "You can only mark attendance during the scheduled class time.",
          });
        }
      } else {
        // If not today, maybe block it? Or allow admin?
        // "teacher can mark the attendance only on the assigned time" -> implies strictness.
        // Let's block teachers from marking past/future dates if strictness is required.
        // But usually, teachers might forget.
        // However, "assigned time" is strong wording.
        // Let's block if it's not today.
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message:
            "You can only mark attendance on the current day during the scheduled time.",
        });
      }
    }

    // ---------------------------------------------------------

    // Check if attendance is already submitted
    const [existingSubmission] = await connection.query(
      `SELECT is_submitted, submitted_by FROM attendance 
       WHERE class_id = ? AND section_id = ? AND subject_id = ? AND date = ? AND is_submitted = TRUE
       LIMIT 1`,
      [class_id, section_id, subject_id, date]
    );

    if (existingSubmission.length > 0) {
      // Only admin can update submitted attendance
      const adminRoles = ["super_admin", "principal", "vice_principal"];
      if (!adminRoles.includes(userRole)) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message:
            "Attendance is already submitted. Only administrators can modify it.",
        });
      }
    }

    // Delete existing records for this class/section/subject/date
    await connection.query(
      `DELETE FROM attendance WHERE class_id = ? AND section_id = ? AND subject_id = ? AND date = ?`,
      [class_id, section_id, subject_id, date]
    );

    // Insert new attendance records
    const values = attendance_records.map((record) => [
      record.student_id,
      record.class_id,
      record.section_id,
      subject_id,
      date,
      record.status || "present",
      record.remarks || null,
      marked_by,
      false, // is_submitted
      null, // submitted_at
      null, // submitted_by
    ]);

    await connection.query(
      `INSERT INTO attendance 
       (student_id, class_id, section_id, subject_id, date, status, remarks, marked_by, is_submitted, submitted_at, submitted_by) 
       VALUES ?`,
      [values]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${attendance_records.length} students`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Submit attendance (lock it)
const submitAttendance = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { class_id, section_id, subject_id, date } = req.body;
    const submitted_by = req.user.id;
    const userRole = req.user.role;

    if (!class_id || !section_id || !date) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "class_id, section_id, and date are required",
      });
    }

    // Check if attendance exists for this date
    let checkQuery = `SELECT COUNT(*) as count FROM attendance 
       WHERE class_id = ? AND section_id = ? AND date = ?`;
    let checkParams = [class_id, section_id, date];

    if (subject_id) {
      checkQuery += " AND subject_id = ?";
      checkParams.push(subject_id);
    } else {
      checkQuery += " AND subject_id IS NULL";
    }

    const [existing] = await connection.query(checkQuery, checkParams);

    if (existing[0].count === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "No attendance records found for this date. Please mark attendance first.",
      });
    }

    // Check if already submitted
    let submittedQuery = `SELECT is_submitted FROM attendance 
       WHERE class_id = ? AND section_id = ? AND date = ? AND is_submitted = TRUE`;

    if (subject_id) {
      submittedQuery += " AND subject_id = ?";
    } else {
      submittedQuery += " AND subject_id IS NULL";
    }
    submittedQuery += " LIMIT 1";

    const [submitted] = await connection.query(submittedQuery, checkParams);

    if (submitted.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Attendance is already submitted for this date",
      });
    }

    // Update all records to submitted
    let updateQuery = `UPDATE attendance 
       SET is_submitted = TRUE, submitted_at = NOW(), submitted_by = ?
       WHERE class_id = ? AND section_id = ? AND date = ?`;
    let updateParams = [submitted_by, class_id, section_id, date];

    if (subject_id) {
      updateQuery += " AND subject_id = ?";
      updateParams.push(subject_id);
    } else {
      updateQuery += " AND subject_id IS NULL";
    }

    await connection.query(updateQuery, updateParams);

    await connection.commit();

    res.json({
      success: true,
      message: "Attendance submitted successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Submit attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit attendance",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Unlock submitted attendance (admin only)
const unlockAttendance = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { class_id, section_id, subject_id, date } = req.body;

    if (!class_id || !section_id || !date) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "class_id, section_id, and date are required",
      });
    }

    // Update all records to unlocked
    let updateQuery = `UPDATE attendance 
       SET is_submitted = FALSE, submitted_at = NULL, submitted_by = NULL
       WHERE class_id = ? AND section_id = ? AND date = ?`;
    let updateParams = [class_id, section_id, date];

    if (subject_id) {
      updateQuery += " AND subject_id = ?";
      updateParams.push(subject_id);
    } else {
      updateQuery += " AND subject_id IS NULL";
    }

    const [result] = await connection.query(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "No attendance records found for this date",
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Attendance unlocked successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Unlock attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlock attendance",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Update attendance record (for individual records)
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const userRole = req.user.role;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["present", "absent", "late", "half_day", "excused"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be: present, absent, late, half_day, or excused",
      });
    }

    // Check if attendance is submitted
    const [record] = await pool.query(
      `SELECT is_submitted FROM attendance WHERE id = ?`,
      [id]
    );

    if (record.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (record[0].is_submitted) {
      const adminRoles = ["super_admin", "principal", "vice_principal"];
      if (!adminRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message:
            "Attendance is submitted. Only administrators can modify it.",
        });
      }
    }

    const [result] = await pool.query(
      `UPDATE attendance SET status = ?, remarks = ?, updated_at = NOW() WHERE id = ?`,
      [status, remarks || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    // Check if attendance is submitted
    const [record] = await pool.query(
      `SELECT is_submitted FROM attendance WHERE id = ?`,
      [id]
    );

    if (record.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (record[0].is_submitted) {
      const adminRoles = ["super_admin", "principal", "vice_principal"];
      if (!adminRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message:
            "Attendance is submitted. Only administrators can delete it.",
        });
      }
    }

    const [result] = await pool.query("DELETE FROM attendance WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
      error: error.message,
    });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const {
      class_id,
      section_id,
      subject_id,
      student_id,
      start_date,
      end_date,
    } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;

    const params = [];

    // Role-based filtering
    if (userRole === "teacher") {
      query += ` AND EXISTS (
        SELECT 1 FROM sections sect 
        WHERE sect.id = s.section_id 
        AND sect.class_teacher_id = (
          SELECT id FROM teachers WHERE user_id = ?
        )
      )`;
      params.push(userId);
    } else if (userRole === "student") {
      // Students can only see their own stats
      query += ` AND s.user_id = ?`;
      params.push(userId);
    }

    if (class_id) {
      query += " AND s.class_id = ?";
      params.push(class_id);
    }

    if (section_id) {
      query += " AND s.section_id = ?";
      params.push(section_id);
    }

    if (subject_id) {
      query += " AND a.subject_id = ?";
      params.push(subject_id);
    }

    if (student_id) {
      query += " AND a.student_id = ?";
      params.push(student_id);
    }

    if (start_date) {
      query += " AND a.date >= ?";
      params.push(start_date);
    }

    if (end_date) {
      query += " AND a.date <= ?";
      params.push(end_date);
    }

    const [stats] = await pool.query(query, params);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAttendance,
  checkSubmissionStatus,
  markAttendance,
  submitAttendance,
  unlockAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
};
