const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const path = require("path");
const fs = require("fs");

// ---------------------
// GET ALL TEACHERS
// ---------------------
const getAllTeachers = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT t.*, u.email, u.is_active, u.last_login 
      FROM teachers t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }
    if (search) {
      const searchTerm = `%${search}%`;
      query +=
        " AND (t.first_name LIKE ? OR t.last_name LIKE ? OR t.employee_id LIKE ?)";
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY t.first_name, t.last_name";
    const [teachers] = await pool.query(query, params);

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message,
    });
  }
};

// ---------------------
// ASSIGN SCHEDULE
// ---------------------
const assignSchedule = async (req, res) => {
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

    // 1. Verify Teacher-Class-Subject Assignment
    // Check if teacher is assigned to this section-subject combination (section level)
    // OR assigned to this class-subject combination (class level)
    const [sectionAssignment] = await connection.query(
      `SELECT id FROM section_subject_teachers 
       WHERE teacher_id = ? AND section_id = ? AND subject_id = ? AND is_active = 1`,
      [teacher_id, section_id, subject_id]
    );

    const [classAssignment] = await connection.query(
      `SELECT id FROM class_subjects 
       WHERE teacher_id = ? AND class_id = ? AND subject_id = ? AND is_active = 1`,
      [teacher_id, class_id, subject_id]
    );

    if (sectionAssignment.length === 0 && classAssignment.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Teacher is not assigned to this class/section and subject. Please assign the teacher via Class Details > Sections > Manage Teachers or Class Details > Subjects tab.",
      });
    }

    // 2. Check for conflicts (Teacher availability)
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

    // 3. Check for conflicts (Class availability)
    const [classConflict] = await connection.query(
      `SELECT id FROM timetable 
       WHERE class_id = ? 
       AND day_of_week = ? 
       AND is_active = 1
       AND (
         (start_time <= ? AND end_time > ?) OR 
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        class_id,
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
        message: "Class already has a schedule for this time slot.",
      });
    }

    // 4. Insert into timetable
    await connection.query(
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
      message: "Schedule assigned successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Assign schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign schedule",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ---------------------
// GET TEACHER BY ID
// ---------------------
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const [teachers] = await pool.query(
      `SELECT t.*, u.email, u.is_active, u.last_login, u.created_at as account_created
       FROM teachers t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (teachers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    // Get assigned classes and subjects
    const [assignments] = await pool.query(
      `SELECT tca.*, c.name as class_name, c.grade_level, s.name as subject_name, s.code as subject_code
       FROM class_subjects tca
       LEFT JOIN classes c ON tca.class_id = c.id
       LEFT JOIN subjects s ON tca.subject_id = s.id
       WHERE tca.teacher_id = ?`,
      [id]
    );

    res.json({ success: true, data: { ...teachers[0], assignments } });
  } catch (error) {
    console.error("Get teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher",
      error: error.message,
    });
  }
};

// ---------------------
// CREATE TEACHER
// ---------------------
const createTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      email,
      password,
      employee_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      blood_group,
      address,
      city,
      state,
      pincode,
      phone,
      emergency_contact,
      qualification,
      experience_years,
      specialization,
      joining_date,
      salary,
      status,
    } = req.body;

    if (
      !email ||
      !employee_id ||
      !first_name ||
      !last_name ||
      !date_of_birth ||
      !gender ||
      !phone ||
      !qualification
    ) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check existing email
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    // Check existing employee_id
    const [existingEmp] = await connection.query(
      "SELECT id FROM teachers WHERE employee_id = ?",
      [employee_id]
    );
    if (existingEmp.length > 0) {
      await connection.rollback();
      return res
        .status(409)
        .json({ success: false, message: "Employee ID already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || "Teacher@123", 10);

    // Create user
    const [userResult] = await connection.query(
      "INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, "teacher", true]
    );
    const userId = userResult.insertId;

    // Handle profile photo
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = req.file.path.replace(/\\/g, "/"); // Windows fix
    }

    // Create teacher record
    const [teacherResult] = await connection.query(
      `INSERT INTO teachers (
        user_id, employee_id, first_name, middle_name, last_name,
        date_of_birth, gender, blood_group, address, city, state, pincode,
        phone, emergency_contact, qualification, experience_years, specialization,
        joining_date, salary, profile_photo, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        employee_id,
        first_name,
        middle_name || null,
        last_name,
        date_of_birth,
        gender,
        blood_group || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        phone,
        emergency_contact || null,
        qualification,
        experience_years || null,
        specialization || null,
        joining_date || new Date(),
        salary || null,
        profilePhotoPath,
        status || "active",
      ]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: { id: teacherResult.insertId, user_id: userId, email },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create teacher",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ---------------------
// UPDATE TEACHER
// ---------------------
const updateTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const updateData = { ...req.body };

    // 1. Check if teacher exists
    const [existing] = await connection.query(
      "SELECT id, user_id FROM teachers WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const teacher = existing[0];

    // 2. Handle User table updates (Email)
    if (updateData.email) {
      // Check if email is being changed and if it's already taken
      const [emailCheck] = await connection.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [updateData.email, teacher.user_id]
      );
      if (emailCheck.length > 0) {
        await connection.rollback();
        return res
          .status(409)
          .json({ success: false, message: "Email already exists" });
      }

      await connection.query("UPDATE users SET email = ? WHERE id = ?", [
        updateData.email,
        teacher.user_id,
      ]);
      delete updateData.email; // Remove from teacher update
    }

    // 3. Handle Teacher table updates
    // Remove protected/non-teacher fields
    delete updateData.user_id;
    delete updateData.password;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    // Handle profile photo
    if (req.file) {
      updateData.profile_photo = req.file.path.replace(/\\/g, "/");
    }

    const fields = Object.keys(updateData);
    if (fields.length > 0) {
      const values = Object.values(updateData);
      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      values.push(id);

      await connection.query(
        `UPDATE teachers SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    await connection.commit();
    res.json({ success: true, message: "Teacher updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Update teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update teacher",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ---------------------
// DELETE TEACHER
// ---------------------
const deleteTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [teachers] = await connection.query(
      "SELECT user_id FROM teachers WHERE id = ?",
      [id]
    );
    if (!teachers.length) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const userId = teachers[0].user_id;
    await connection.query("DELETE FROM teachers WHERE id = ?", [id]);
    if (userId)
      await connection.query("DELETE FROM users WHERE id = ?", [userId]);

    await connection.commit();
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Delete teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ---------------------
// GET TEACHER SCHEDULE
// ---------------------
const getTeacherSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week } = req.query;

    let query = `
      SELECT tt.*, c.name as class_name, c.grade_level,
      sec.name as section_name, s.name as subject_name, s.code as subject_code
      FROM timetable tt
      LEFT JOIN classes c ON tt.class_id = c.id
      LEFT JOIN sections sec ON tt.section_id = sec.id
      LEFT JOIN subjects s ON tt.subject_id = s.id
      WHERE tt.teacher_id = ?
    `;

    const params = [id];
    if (day_of_week) {
      query += " AND tt.day_of_week = ?";
      params.push(day_of_week);
    }

    query += " ORDER BY tt.day_of_week, tt.start_time";
    const [schedule] = await pool.query(query, params);

    res.json({ success: true, count: schedule.length, data: schedule });
  } catch (error) {
    console.error("Get teacher schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message,
    });
  }
};

// ---------------------
// GET ROLE-SPECIFIC SCHEDULE
// ---------------------
const getSchedule = async (req, res) => {
  try {
    const user = req.user; // set by authMiddleware
    const { day_of_week, academic_year } = req.query;

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

    // Role-based filtering
    if (user.role === "teacher") {
      query += " AND tt.teacher_id = ?";
      params.push(user.id);
    } else if (user.role === "student") {
      query += " AND tt.class_id = ? AND tt.section_id = ?";
      params.push(user.class_id, user.section_id);
    }
    // Admins (super_admin, principal) see all schedules

    // Optional filters
    if (day_of_week) {
      query += " AND tt.day_of_week = ?";
      params.push(day_of_week);
    }
    if (academic_year) {
      query += " AND tt.academic_year = ?";
      params.push(academic_year);
    }

    query += `
      ORDER BY FIELD(tt.day_of_week, 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), tt.start_time
    `;

    const [schedule] = await pool.query(query, params);
    res.json({ success: true, count: schedule.length, data: schedule });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message,
    });
  }
};

// ---------------------
// GET SINGLE PERIOD DETAIL
// ---------------------
const getScheduleDetail = async (req, res) => {
  try {
    const { id } = req.params; // timetable id

    const query = `
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
      WHERE tt.id = ? AND tt.is_active = 1
    `;

    const [periods] = await pool.query(query, [id]);

    if (!periods.length) {
      return res
        .status(404)
        .json({ success: false, message: "Period not found" });
    }

    res.json({ success: true, data: periods[0] });
  } catch (err) {
    console.error("Get schedule detail error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch period detail",
      error: err.message,
    });
  }
};

// ---------------------
// GET MY SUBJECTS (Teacher's assigned subjects with class/section info)
// ---------------------
const getMySubjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get teacher ID from user ID
    const [teacher] = await pool.query(
      "SELECT id FROM teachers WHERE user_id = ?",
      [userId]
    );

    if (teacher.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const teacherId = teacher[0].id;

    // Get subjects assigned at section level
    const [sectionSubjects] = await pool.query(
      `SELECT DISTINCT
        s.id as subject_id,
        s.name as subject_name,
        s.code as subject_code,
        s.description as subject_description,
        c.id as class_id,
        c.name as class_name,
        c.grade_level,
        sec.id as section_id,
        sec.name as section_name,
        'section' as assignment_level
      FROM section_subject_teachers sst
      JOIN subjects s ON sst.subject_id = s.id
      JOIN sections sec ON sst.section_id = sec.id
      JOIN classes c ON sec.class_id = c.id
      WHERE sst.teacher_id = ? AND sst.is_active = 1 AND s.is_active = 1
      ORDER BY s.name, c.grade_level, c.name, sec.name`,
      [teacherId]
    );

    // Get subjects assigned at class level (where no section-specific assignment exists)
    const [classSubjects] = await pool.query(
      `SELECT DISTINCT
        s.id as subject_id,
        s.name as subject_name,
        s.code as subject_code,
        s.description as subject_description,
        c.id as class_id,
        c.name as class_name,
        c.grade_level,
        NULL as section_id,
        'All Sections' as section_name,
        'class' as assignment_level
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      JOIN classes c ON cs.class_id = c.id
      WHERE cs.teacher_id = ? AND cs.is_active = 1 AND s.is_active = 1
      ORDER BY s.name, c.grade_level, c.name`,
      [teacherId]
    );

    // Combine both results
    const allSubjects = [...sectionSubjects, ...classSubjects];

    res.json({
      success: true,
      count: allSubjects.length,
      data: allSubjects,
    });
  } catch (error) {
    console.error("Get my subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned subjects",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getSchedule,
  getScheduleDetail,
  getTeacherSchedule,
  assignSchedule,
  getMySubjects,
};
