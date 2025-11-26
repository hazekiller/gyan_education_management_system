const pool = require("../config/database");

// Get all schedules for an exam
const getExamSchedules = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const query = `
      SELECT 
        exam_schedule.*,
        subjects.name as subject_name,
        subjects.code as subject_code
      FROM exam_schedule
      LEFT JOIN subjects ON exam_schedule.subject_id = subjects.id
      WHERE exam_schedule.exam_id = ?
      ORDER BY exam_schedule.exam_date, exam_schedule.start_time
    `;

    const [schedules] = await pool.query(query, [exam_id]);

    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("Get exam schedules error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam schedules",
      error: error.message,
    });
  }
};

// Get single schedule by ID
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        exam_schedule.*,
        subjects.name as subject_name,
        subjects.code as subject_code,
        exams.name as exam_name
      FROM exam_schedule
      LEFT JOIN subjects ON exam_schedule.subject_id = subjects.id
      LEFT JOIN exams ON exam_schedule.exam_id = exams.id
      WHERE exam_schedule.id = ?
    `;

    const [schedule] = await pool.query(query, [id]);

    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.json({
      success: true,
      data: schedule[0],
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message,
    });
  }
};

// Create exam schedule
const createSchedule = async (req, res) => {
  try {
    const {
      exam_id,
      subject_id,
      exam_date,
      start_time,
      end_time,
      room_number,
      max_marks,
      passing_marks,
    } = req.body;

    // Validate required fields
    if (
      !exam_id ||
      !subject_id ||
      !exam_date ||
      !start_time ||
      !end_time ||
      !max_marks ||
      !passing_marks
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if schedule already exists for this exam and subject
    const [existing] = await pool.query(
      "SELECT id FROM exam_schedule WHERE exam_id = ? AND subject_id = ?",
      [exam_id, subject_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Schedule already exists for this subject in this exam",
      });
    }

    // Insert schedule
    const [result] = await pool.query(
      `INSERT INTO exam_schedule 
       (exam_id, subject_id, exam_date, start_time, end_time, room_number, max_marks, passing_marks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exam_id,
        subject_id,
        exam_date,
        start_time,
        end_time,
        room_number,
        max_marks,
        passing_marks,
      ]
    );

    // Fetch the created schedule with subject info
    const [createdSchedule] = await pool.query(
      `SELECT 
        exam_schedule.*,
        subjects.name as subject_name,
        subjects.code as subject_code
      FROM exam_schedule
      LEFT JOIN subjects ON exam_schedule.subject_id = subjects.id
      WHERE exam_schedule.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: createdSchedule[0],
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create schedule",
      error: error.message,
    });
  }
};

// Create multiple schedules at once
const createMultipleSchedules = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { exam_id, schedules } = req.body;

    if (
      !exam_id ||
      !schedules ||
      !Array.isArray(schedules) ||
      schedules.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    await connection.beginTransaction();

    const createdSchedules = [];

    for (const schedule of schedules) {
      const {
        subject_id,
        exam_date,
        start_time,
        end_time,
        room_number,
        max_marks,
        passing_marks,
      } = schedule;

      // Check if already exists
      const [existing] = await connection.query(
        "SELECT id FROM exam_schedule WHERE exam_id = ? AND subject_id = ?",
        [exam_id, subject_id]
      );

      if (existing.length === 0) {
        const [result] = await connection.query(
          `INSERT INTO exam_schedule 
           (exam_id, subject_id, exam_date, start_time, end_time, room_number, max_marks, passing_marks) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            exam_id,
            subject_id,
            exam_date,
            start_time,
            end_time,
            room_number,
            max_marks,
            passing_marks,
          ]
        );

        createdSchedules.push(result.insertId);
      }
    }

    await connection.commit();

    // Fetch all created schedules
    if (createdSchedules.length > 0) {
      const placeholders = createdSchedules.map(() => "?").join(",");
      const [allSchedules] = await connection.query(
        `SELECT 
          exam_schedule.*,
          subjects.name as subject_name,
          subjects.code as subject_code
        FROM exam_schedule
        LEFT JOIN subjects ON exam_schedule.subject_id = subjects.id
        WHERE exam_schedule.id IN (${placeholders})
        ORDER BY exam_schedule.exam_date, exam_schedule.start_time`,
        createdSchedules
      );

      res.status(201).json({
        success: true,
        message: `${createdSchedules.length} schedule(s) created successfully`,
        data: allSchedules,
      });
    } else {
      res.json({
        success: true,
        message: "No new schedules created (may already exist)",
        data: [],
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error("Create multiple schedules error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create schedules",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Update exam schedule
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject_id,
      exam_date,
      start_time,
      end_time,
      room_number,
      max_marks,
      passing_marks,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE exam_schedule 
       SET subject_id = ?, exam_date = ?, start_time = ?, end_time = ?, 
           room_number = ?, max_marks = ?, passing_marks = ?
       WHERE id = ?`,
      [
        subject_id,
        exam_date,
        start_time,
        end_time,
        room_number,
        max_marks,
        passing_marks,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // Fetch updated schedule
    const [updatedSchedule] = await pool.query(
      `SELECT 
        exam_schedule.*,
        subjects.name as subject_name,
        subjects.code as subject_code
      FROM exam_schedule
      LEFT JOIN subjects ON exam_schedule.subject_id = subjects.id
      WHERE exam_schedule.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Schedule updated successfully",
      data: updatedSchedule[0],
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error: error.message,
    });
  }
};

// Delete exam schedule
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM exam_schedule WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
      error: error.message,
    });
  }
};

// Delete all schedules for an exam
const deleteExamSchedules = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM exam_schedule WHERE exam_id = ?",
      [exam_id]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} schedule(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Delete exam schedules error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete exam schedules",
      error: error.message,
    });
  }
};

module.exports = {
  getExamSchedules,
  getScheduleById,
  createSchedule,
  createMultipleSchedules,
  updateSchedule,
  deleteSchedule,
  deleteExamSchedules,
};
