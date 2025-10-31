const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Get all teachers
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
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (t.first_name LIKE ? OR t.last_name LIKE ? OR t.employee_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY t.first_name, t.last_name';

    const [teachers] = await pool.query(query, params);

    res.json({
      success: true,
      count: teachers.length,
      data: teachers
    });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers',
      error: error.message
    });
  }
};

// Get single teacher
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
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Get assigned classes and subjects
    const [assignments] = await pool.query(
      `SELECT tca.*, c.name as class_name, c.grade_level, s.name as subject_name, s.code as subject_code
       FROM teacher_class_assignments tca
       LEFT JOIN classes c ON tca.class_id = c.id
       LEFT JOIN subjects s ON tca.subject_id = s.id
       WHERE tca.teacher_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...teachers[0],
        assignments
      }
    });

  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher',
      error: error.message
    });
  }
};

// Create teacher
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
      status
    } = req.body;

    // Validation
    if (!email || !employee_id || !first_name || !last_name || 
        !date_of_birth || !gender || !phone || !qualification) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, employee_id, first_name, last_name, date_of_birth, gender, phone, qualification'
      });
    }

    // Check if email or employee_id already exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const [existingEmp] = await connection.query(
      'SELECT id FROM teachers WHERE employee_id = ?',
      [employee_id]
    );

    if (existingEmp.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    // Default password if not provided
    const teacherPassword = password || 'Teacher@123';
    const hashedPassword = await bcrypt.hash(teacherPassword, 10);

    // Create user account
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'teacher', true]
    );

    const userId = userResult.insertId;

    // Handle profile photo if uploaded
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = req.file.path;
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
        userId, employee_id, first_name, middle_name || null, last_name,
        date_of_birth, gender, blood_group || null, address || null, 
        city || null, state || null, pincode || null,
        phone, emergency_contact || null, qualification, experience_years || null, 
        specialization || null, joining_date || new Date(), salary || null, 
        profilePhotoPath, status || 'active'
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: {
        id: teacherResult.insertId,
        user_id: userId,
        email: email
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if teacher exists
    const [existing] = await pool.query('SELECT id FROM teachers WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

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
        message: 'No fields to update'
      });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);

    await pool.query(
      `UPDATE teachers SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Teacher updated successfully'
    });

  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher',
      error: error.message
    });
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;

    const [teachers] = await connection.query(
      'SELECT user_id FROM teachers WHERE id = ?',
      [id]
    );

    if (teachers.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const userId = teachers[0].user_id;

    await connection.query('DELETE FROM teachers WHERE id = ?', [id]);

    if (userId) {
      await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete teacher',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Get teacher's schedule
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
      query += ' AND tt.day_of_week = ?';
      params.push(day_of_week);
    }

    query += ' ORDER BY tt.day_of_week, tt.start_time';

    const [schedule] = await pool.query(query, params);

    res.json({
      success: true,
      count: schedule.length,
      data: schedule
    });

  } catch (error) {
    console.error('Get teacher schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSchedule
};
