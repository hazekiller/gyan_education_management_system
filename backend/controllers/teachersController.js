const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

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
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND (t.first_name LIKE ? OR t.last_name LIKE ? OR t.employee_id LIKE ?)';
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
      return res.status(404).json({ success: false, message: 'Teacher not found' });
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
    console.error('Get teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher', error: error.message });
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
      email, password, employee_id, first_name, middle_name, last_name,
      date_of_birth, gender, blood_group, address, city, state, pincode,
      phone, emergency_contact, qualification, experience_years, specialization,
      joining_date, salary, status
    } = req.body;

    if (!email || !employee_id || !first_name || !last_name || !date_of_birth || !gender || !phone || !qualification) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check existing email
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // Check existing employee_id
    const [existingEmp] = await connection.query('SELECT id FROM teachers WHERE employee_id = ?', [employee_id]);
    if (existingEmp.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Employee ID already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'Teacher@123', 10);

    // Create user
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'teacher', true]
    );
    const userId = userResult.insertId;

    // Handle profile photo
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = req.file.path.replace(/\\/g, '/'); // Windows fix
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
        city || null, state || null, pincode || null, phone, emergency_contact || null,
        qualification, experience_years || null, specialization || null,
        joining_date || new Date(), salary || null, profilePhotoPath, status || 'active'
      ]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Teacher created successfully', data: { id: teacherResult.insertId, user_id: userId, email } });
  } catch (error) {
    await connection.rollback();
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to create teacher', error: error.message });
  } finally {
    connection.release();
  }
};

// ---------------------
// UPDATE TEACHER
// ---------------------
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const [existing] = await pool.query('SELECT id FROM teachers WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Teacher not found' });

    // Remove protected fields
    delete updateData.user_id;
    delete updateData.password;

    // Handle profile photo
    if (req.file) updateData.profile_photo = req.file.path.replace(/\\/g, '/');

    const fields = Object.keys(updateData);
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });

    const values = Object.values(updateData);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    values.push(id);

    await pool.query(`UPDATE teachers SET ${setClause}, updated_at = NOW() WHERE id = ?`, values);
    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to update teacher', error: error.message });
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

    const [teachers] = await connection.query('SELECT user_id FROM teachers WHERE id = ?', [id]);
    if (!teachers.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const userId = teachers[0].user_id;
    await connection.query('DELETE FROM teachers WHERE id = ?', [id]);
    if (userId) await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    await connection.commit();
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete teacher', error: error.message });
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
      query += ' AND tt.day_of_week = ?';
      params.push(day_of_week);
    }

    query += ' ORDER BY tt.day_of_week, tt.start_time';
    const [schedule] = await pool.query(query, params);

    res.json({ success: true, count: schedule.length, data: schedule });
  } catch (error) {
    console.error('Get teacher schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule', error: error.message });
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
    if (user.role === 'teacher') {
      query += ' AND tt.teacher_id = ?';
      params.push(user.id);
    } else if (user.role === 'student') {
      query += ' AND tt.class_id = ? AND tt.section_id = ?';
      params.push(user.class_id, user.section_id);
    }
    // Admins (super_admin, principal) see all schedules

    // Optional filters
    if (day_of_week) {
      query += ' AND tt.day_of_week = ?';
      params.push(day_of_week);
    }
    if (academic_year) {
      query += ' AND tt.academic_year = ?';
      params.push(academic_year);
    }

    query += `
      ORDER BY FIELD(tt.day_of_week, 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), tt.start_time
    `;

    const [schedule] = await pool.query(query, params);
    res.json({ success: true, count: schedule.length, data: schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule', error: error.message });
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
      return res.status(404).json({ success: false, message: 'Period not found' });
    }

    res.json({ success: true, data: periods[0] });
  } catch (err) {
    console.error('Get schedule detail error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch period detail', error: err.message });
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
};


