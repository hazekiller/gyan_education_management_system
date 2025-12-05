const pool = require("../config/database");
const bcrypt = require("bcryptjs");

/**
 * UNIFIED STUDENT DATA FUNCTION
 * Single source of truth for student data
 * Ensures consistency between admin view and student self-view
 */
const getStudentData = async (studentId, options = {}) => {
  const { userId, userRole } = options;

  const query = `
    SELECT 
      s.*,
      c.name as class_name,
      c.grade_level,
      sec.name as section_name,
      u.email,
      u.is_active as account_active,
      u.Role as account_role,
      u.last_login,
      u.created_at as account_created_at
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN sections sec ON s.section_id = sec.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `;

  const [students] = await pool.query(query, [studentId]);

  if (students.length === 0) {
    return null;
  }

  const student = students[0];

  // Apply row-level security if needed
  if (userRole === "student" && userId && student.user_id !== userId) {
    throw new Error("Unauthorized access to student data");
  }

  return student;
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const { class_id, section_id, status, search } = req.query;

    let query = `
      SELECT 
        s.*,
        c.name as class_name,
        sec.name as section_name,
        u.email
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (class_id) {
      query += " AND s.class_id = ?";
      params.push(class_id);
    }

    if (section_id) {
      query += " AND s.section_id = ?";
      params.push(section_id);
    }

    if (status) {
      query += " AND s.status = ?";
      params.push(status);
    }

    if (search) {
      query +=
        " AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_number LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY s.created_at DESC";

    const [students] = await pool.query(query, params);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// Get student by ID - Now uses unified function
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await getStudentData(id, {
      userId: req.user?.id,
      userRole: req.user?.role,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get student error:", error);

    if (error.message === "Unauthorized access to student data") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// Create student
const createStudent = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      admission_number,
      first_name,
      middle_name,
      last_name,
      email,
      password,
      phone,
      date_of_birth,
      gender,
      blood_group,
      class_id,
      section_id,
      roll_number,
      admission_date,
      father_name,
      mother_name,
      parent_phone,
      parent_email,
      address,
      city,
      state,
      pincode,
      status,
    } = req.body;

    // Validate required fields
    if (
      !admission_number ||
      !first_name ||
      !last_name ||
      !email ||
      !date_of_birth ||
      !gender ||
      !class_id ||
      !parent_phone
    ) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: admission_number, first_name, last_name, email, date_of_birth, gender, class_id, parent_phone",
      });
    }

    // Default password if not provided
    const studentPassword = password || "Student@123";
    const hashedPassword = await bcrypt.hash(studentPassword, 10);

    // Create user account
    const [userResult] = await connection.query(
      "INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, "student", true]
    );

    const userId = userResult.insertId;

    // Handle profile photo if uploaded
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = req.file.path;
    }

    // Create student record
    const [studentResult] = await connection.query(
      `INSERT INTO students (
        user_id, admission_number, first_name, middle_name, last_name,
        email, phone, date_of_birth, gender, blood_group,
        class_id, section_id, roll_number, admission_date,
        father_name, mother_name, parent_phone, parent_email,
        address, city, state, pincode, profile_photo, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        admission_number,
        first_name,
        middle_name || null,
        last_name,
        email,
        phone || null,
        date_of_birth,
        gender,
        blood_group || null,
        class_id,
        section_id || null,
        roll_number || null,
        admission_date || new Date(),
        father_name || null,
        mother_name || null,
        parent_phone,
        parent_email || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        profilePhotoPath,
        status || "active",
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: {
        id: studentResult.insertId,
        user_id: userId,
        email: email,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create student",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.user_id;
    delete updateData.password;

    // Handle profile photo if uploaded
    if (req.file) {
      updateData.profile_photo = req.file.path;
    }

    // Build update query dynamically
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    values.push(id);

    await pool.query(
      `UPDATE students SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get student's user_id
    const [students] = await connection.query(
      "SELECT user_id FROM students WHERE id = ?",
      [id]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const userId = students[0].user_id;

    // Delete student record
    await connection.query("DELETE FROM students WHERE id = ?", [id]);

    // Delete user account
    await connection.query("DELETE FROM users WHERE id = ?", [userId]);

    await connection.commit();

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Get student attendance
const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT * FROM attendance
      WHERE student_id = ?
    `;
    const params = [id];

    if (start_date) {
      query += " AND date >= ?";
      params.push(start_date);
    }

    if (end_date) {
      query += " AND date <= ?";
      params.push(end_date);
    }

    query += " ORDER BY date DESC";

    const [attendance] = await pool.query(query, params);

    res.json({
      success: true,
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

// Get student results
const getStudentResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { academic_year } = req.query;

    let query = `
      SELECT 
        er.*,
        e.name as exam_name,
        e.exam_type,
        e.total_marks as exam_total_marks,
        s.name as subject_name
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      LEFT JOIN subjects s ON er.subject_id = s.id
      WHERE er.student_id = ?
    `;
    const params = [id];

    if (academic_year) {
      query += " AND e.academic_year = ?";
      params.push(academic_year);
    }

    query += " ORDER BY e.start_date DESC";

    const [results] = await pool.query(query, params);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentData, // Unified data source function
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentResults,
};
