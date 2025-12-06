const pool = require("../config/database");

// ---------------------
// GET TIMETABLE (Generic)
// ---------------------
const getTimetable = async (req, res) => {
  try {
    const {
      class_id,
      section_id,
      subject_id,
      day_of_week,
      academic_year,
      teacher_id,
      user_id,
    } = req.query;

    let query = `
      SELECT tt.*, 
        c.name AS class_name, 
        c.grade_level,
        sec.name AS section_name, 
        s.name AS subject_name,
        s.code AS subject_code,
        t.first_name AS teacher_first_name,
        t.last_name AS teacher_last_name
      FROM timetable tt
      LEFT JOIN classes c ON tt.class_id = c.id
      LEFT JOIN sections sec ON tt.section_id = sec.id
      LEFT JOIN subjects s ON tt.subject_id = s.id
      LEFT JOIN teachers t ON tt.teacher_id = t.id
      WHERE tt.is_active = 1
    `;
    const params = [];

    if (class_id) {
      query += " AND tt.class_id = ?";
      params.push(class_id);
    }
    if (section_id) {
      query += " AND tt.section_id = ?";
      params.push(section_id);
    }
    if (subject_id) {
      query += " AND tt.subject_id = ?";
      params.push(subject_id);
    }
    if (teacher_id) {
      query += " AND tt.teacher_id = ?";
      params.push(teacher_id);
    }
    if (user_id) {
      query += " AND t.user_id = ?";
      params.push(user_id);
    }
    if (day_of_week) {
      query += " AND tt.day_of_week = ?";
      params.push(day_of_week);
    }
    if (academic_year) {
      query += " AND tt.academic_year = ?";
      params.push(academic_year);
    }

    query +=
      " ORDER BY FIELD(tt.day_of_week, 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), tt.start_time";

    const [schedule] = await pool.query(query, params);
    res.json({ success: true, count: schedule.length, data: schedule });
  } catch (err) {
    console.error("Get timetable error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
      error: err.message,
    });
  }
};

// ---------------------
// CREATE TIMETABLE ENTRY
// ---------------------
const createTimetableEntry = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      teacher_id,
      class_id,
      section_id,
      subject_id,
      day_of_week,
      start_time,
      end_time,
      room_number,
      academic_year,
    } = req.body;

    if (
      !teacher_id ||
      !class_id ||
      !section_id ||
      !subject_id ||
      !day_of_week ||
      !start_time ||
      !end_time ||
      !academic_year
    ) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 1. Check for conflicts (Teacher availability)
    const [teacherConflict] = await connection.query(
      `SELECT id FROM timetable 
       WHERE teacher_id = ? 
       AND day_of_week = ? 
       AND is_active = 1
       AND (
         (start_time <= ? AND end_time > ?) OR 
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        teacher_id,
        day_of_week,
        start_time,
        start_time,
        end_time,
        end_time,
        start_time,
        end_time,
      ]
    );

    if (teacherConflict.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Teacher is already booked for this time slot.",
      });
    }

    // 2. Check for conflicts (Class availability)
    const [classConflict] = await connection.query(
      `SELECT id FROM timetable 
       WHERE class_id = ? 
       AND section_id = ?
       AND day_of_week = ? 
       AND is_active = 1
       AND (
         (start_time <= ? AND end_time > ?) OR 
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        class_id,
        section_id,
        day_of_week,
        start_time,
        start_time,
        end_time,
        end_time,
        start_time,
        end_time,
      ]
    );

    if (classConflict.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Class/Section already has a schedule for this time slot.",
      });
    }

    // 3. Insert into timetable
    const [result] = await connection.query(
      `INSERT INTO timetable (
        teacher_id, class_id, section_id, subject_id, 
        day_of_week, start_time, end_time, room_number, 
        academic_year, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        teacher_id,
        class_id,
        section_id,
        subject_id,
        day_of_week,
        start_time,
        end_time,
        room_number || null,
        academic_year,
      ]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Schedule entry created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create timetable entry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create schedule entry",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ---------------------
// UPDATE TIMETABLE ENTRY
// ---------------------
const updateTimetableEntry = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const {
      teacher_id,
      class_id,
      section_id,
      subject_id,
      day_of_week,
      start_time,
      end_time,
      room_number,
      academic_year,
    } = req.body;

    // Check if entry exists
    const [existing] = await connection.query(
      "SELECT * FROM timetable WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Schedule entry not found" });
    }

    // Check for conflicts (excluding current entry)
    // Teacher Conflict
    if (teacher_id && day_of_week && start_time && end_time) {
      const [teacherConflict] = await connection.query(
        `SELECT id FROM timetable 
         WHERE teacher_id = ? 
         AND day_of_week = ? 
         AND is_active = 1
         AND id != ?
         AND (
           (start_time <= ? AND end_time > ?) OR 
           (start_time < ? AND end_time >= ?) OR
           (start_time >= ? AND end_time <= ?)
         )`,
        [
          teacher_id,
          day_of_week,
          id,
          start_time,
          start_time,
          end_time,
          end_time,
          start_time,
          end_time,
        ]
      );

      if (teacherConflict.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: "Teacher is already booked for this time slot.",
        });
      }
    }

    // Class Conflict
    if (class_id && section_id && day_of_week && start_time && end_time) {
      const [classConflict] = await connection.query(
        `SELECT id FROM timetable 
         WHERE class_id = ? 
         AND section_id = ?
         AND day_of_week = ? 
         AND is_active = 1
         AND id != ?
         AND (
           (start_time <= ? AND end_time > ?) OR 
           (start_time < ? AND end_time >= ?) OR
           (start_time >= ? AND end_time <= ?)
         )`,
        [
          class_id,
          section_id,
          day_of_week,
          id,
          start_time,
          start_time,
          end_time,
          end_time,
          start_time,
          end_time,
        ]
      );

      if (classConflict.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: "Class/Section already has a schedule for this time slot.",
        });
      }
    }

    // Update
    const updateFields = [];
    const updateValues = [];

    if (teacher_id) {
      updateFields.push("teacher_id = ?");
      updateValues.push(teacher_id);
    }
    if (class_id) {
      updateFields.push("class_id = ?");
      updateValues.push(class_id);
    }
    if (section_id) {
      updateFields.push("section_id = ?");
      updateValues.push(section_id);
    }
    if (subject_id) {
      updateFields.push("subject_id = ?");
      updateValues.push(subject_id);
    }
    if (day_of_week) {
      updateFields.push("day_of_week = ?");
      updateValues.push(day_of_week);
    }
    if (start_time) {
      updateFields.push("start_time = ?");
      updateValues.push(start_time);
    }
    if (end_time) {
      updateFields.push("end_time = ?");
      updateValues.push(end_time);
    }
    if (room_number !== undefined) {
      updateFields.push("room_number = ?");
      updateValues.push(room_number);
    }
    if (academic_year) {
      updateFields.push("academic_year = ?");
      updateValues.push(academic_year);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await connection.query(
        `UPDATE timetable SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );
    }

    await connection.commit();
    res.json({ success: true, message: "Schedule entry updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Update timetable entry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update schedule entry",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ---------------------
// DELETE TIMETABLE ENTRY
// ---------------------
const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM timetable WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule entry not found" });
    }

    res.json({ success: true, message: "Schedule entry deleted successfully" });
  } catch (error) {
    console.error("Delete timetable entry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule entry",
      error: error.message,
    });
  }
};

module.exports = {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
};
