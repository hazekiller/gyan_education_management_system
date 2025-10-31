const pool = require('../config/database');

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const { status, grade_level } = req.query;
    
    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(DISTINCT tca.teacher_id) as teacher_count
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      LEFT JOIN teacher_class_assignments tca ON c.id = tca.class_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    if (grade_level) {
      query += ' AND c.grade_level = ?';
      params.push(grade_level);
    }
    
    query += ' GROUP BY c.id ORDER BY c.grade_level, c.name';
    
    const [classes] = await pool.query(query, params);
    
    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message
    });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [classes] = await pool.query('SELECT * FROM classes WHERE id = ?', [id]);
    
    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Get sections for this class
    const [sections] = await pool.query(
      'SELECT * FROM sections WHERE class_id = ? ORDER BY name',
      [id]
    );
    
    // Get students count
    const [studentCount] = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE class_id = ?',
      [id]
    );
    
    // Get assigned teachers
    const [teachers] = await pool.query(`
      SELECT t.*, u.email, tca.subject_id, s.name as subject_name
      FROM teacher_class_assignments tca
      JOIN teachers t ON tca.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN subjects s ON tca.subject_id = s.id
      WHERE tca.class_id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: {
        ...classes[0],
        sections,
        student_count: studentCount[0].count,
        teachers
      }
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class',
      error: error.message
    });
  }
};

// Create class
const createClass = async (req, res) => {
  try {
    const {
      name,
      grade_level,
      academic_year,
      class_teacher_id,
      room_number,
      capacity,
      status
    } = req.body;
    
    if (!name || !grade_level || !academic_year) {
      return res.status(400).json({
        success: false,
        message: 'Name, grade level, and academic year are required'
      });
    }
    
    const [result] = await pool.query(
      `INSERT INTO classes (name, grade_level, academic_year, class_teacher_id, room_number, capacity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, grade_level, academic_year, class_teacher_id || null, room_number || null, capacity || null, status || 'active']
    );
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        id: result.insertId,
        name,
        grade_level,
        academic_year
      }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class',
      error: error.message
    });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if class exists
    const [existing] = await pool.query('SELECT id FROM classes WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
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
      `UPDATE classes SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: 'Class updated successfully'
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class',
      error: error.message
    });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if class has students
    const [students] = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE class_id = ?',
      [id]
    );
    
    if (students[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with enrolled students. Please transfer students first.'
      });
    }
    
    await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: error.message
    });
  }
};

// Get class students
const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { section_id } = req.query;
    
    let query = `
      SELECT s.*, u.email, sec.name as section_name
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE s.class_id = ?
    `;
    
    const params = [id];
    
    if (section_id) {
      query += ' AND s.section_id = ?';
      params.push(section_id);
    }
    
    query += ' ORDER BY s.roll_number, s.first_name';
    
    const [students] = await pool.query(query, params);
    
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents
};