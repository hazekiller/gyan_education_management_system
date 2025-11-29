const pool = require("../config/database");

// Get attendance records with submission status
const getAttendance = async (req, res) => {
  try {
    const { class_id, section_id, student_id, date, start_date, end_date } =
      req.query;
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
        u.email as marked_by_email,
        sub_user.email as submitted_by_email
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
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
    const { class_id, section_id, date } = req.query;

    if (!class_id || !section_id || !date) {
      return res.status(400).json({
        success: false,
        message: "class_id, section_id, and date are required",
      });
    }

    const [result] = await pool.query(
      `SELECT is_submitted, submitted_at, submitted_by, 
              u.email as submitted_by_email
       FROM attendance a
       LEFT JOIN users u ON a.submitted_by = u.id
       WHERE a.class_id = ? AND a.section_id = ? AND a.date = ?
       LIMIT 1`,
      [class_id, section_id, date]
    );

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

    const { date, attendance_records } = req.body;
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

    const firstRecord = attendance_records[0];
    const { class_id, section_id } = firstRecord;

    // Check if attendance is already submitted
    const [existingSubmission] = await connection.query(
      `SELECT is_submitted, submitted_by FROM attendance 
       WHERE class_id = ? AND section_id = ? AND date = ? AND is_submitted = TRUE
       LIMIT 1`,
      [class_id, section_id, date]
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

    // Teachers can only mark attendance for their assigned classes
    if (userRole === "teacher") {
      const [teacherCheck] = await connection.query(
        `SELECT t.id FROM teachers t
         JOIN sections s ON s.class_teacher_id = t.id
         WHERE t.user_id = ? AND s.class_id = ? AND s.id = ?`,
        [marked_by, class_id, section_id]
      );

      if (teacherCheck.length === 0) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: "You can only mark attendance for your assigned classes",
        });
      }
    }

    // Delete existing records for this class/section/date
    await connection.query(
      `DELETE FROM attendance WHERE class_id = ? AND section_id = ? AND date = ?`,
      [class_id, section_id, date]
    );

    // Insert new attendance records
    const values = attendance_records.map((record) => [
      record.student_id,
      record.class_id,
      record.section_id,
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
       (student_id, class_id, section_id, date, status, remarks, marked_by, is_submitted, submitted_at, submitted_by) 
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

    const { class_id, section_id, date } = req.body;
    const submitted_by = req.user.id;
    const userRole = req.user.role;

    if (!class_id || !section_id || !date) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "class_id, section_id, and date are required",
      });
    }

    // Teachers can only submit attendance for their assigned classes
    if (userRole === "teacher") {
      const [teacherCheck] = await connection.query(
        `SELECT t.id FROM teachers t
         JOIN sections s ON s.class_teacher_id = t.id
         WHERE t.user_id = ? AND s.class_id = ? AND s.id = ?`,
        [submitted_by, class_id, section_id]
      );

      if (teacherCheck.length === 0) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: "You can only submit attendance for your assigned classes",
        });
      }
    }

    // Check if attendance exists for this date
    const [existing] = await connection.query(
      `SELECT COUNT(*) as count FROM attendance 
       WHERE class_id = ? AND section_id = ? AND date = ?`,
      [class_id, section_id, date]
    );

    if (existing[0].count === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "No attendance records found for this date. Please mark attendance first.",
      });
    }

    // Check if already submitted
    const [submitted] = await connection.query(
      `SELECT is_submitted FROM attendance 
       WHERE class_id = ? AND section_id = ? AND date = ? AND is_submitted = TRUE
       LIMIT 1`,
      [class_id, section_id, date]
    );

    if (submitted.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Attendance is already submitted for this date",
      });
    }

    // Update all records to submitted
    await connection.query(
      `UPDATE attendance 
       SET is_submitted = TRUE, submitted_at = NOW(), submitted_by = ?
       WHERE class_id = ? AND section_id = ? AND date = ?`,
      [submitted_by, class_id, section_id, date]
    );

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

    const { class_id, section_id, date } = req.body;

    if (!class_id || !section_id || !date) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "class_id, section_id, and date are required",
      });
    }

    // Update all records to unlocked
    const [result] = await connection.query(
      `UPDATE attendance 
       SET is_submitted = FALSE, submitted_at = NULL, submitted_by = NULL
       WHERE class_id = ? AND section_id = ? AND date = ?`,
      [class_id, section_id, date]
    );

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
    const { class_id, section_id, student_id, start_date, end_date } =
      req.query;
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
