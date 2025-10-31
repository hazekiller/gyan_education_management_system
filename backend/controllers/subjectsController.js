const pool = require('../config/database');

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const { class_id, status } = req.query;
    
    let query = `
      SELECT s.*, 
        COUNT(DISTINCT tca.teacher_id) as teacher_count
      FROM subjects s
      LEFT JOIN teacher_class_assignments tca ON s.id = tca.subject_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    
    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(class_id);
    }
    
    query += ' GROUP BY s.id ORDER BY s.name';
    
    const [subjects] = await pool.query(query, params);
    
    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

// Get subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [subjects] = await pool.query('SELECT * FROM subjects WHERE id = ?', [id]);
    
    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Get assigned teachers
    const [teachers] = await pool.query(`
      SELECT t.*, u.email, tca.class_id, c.name as class_name
      FROM teacher_class_assignments tca
      JOIN teachers t ON tca.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN classes c ON tca.class_id = c.id
      WHERE tca.subject_id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: {
        ...subjects[0],
        teachers
      }
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject',
      error: error.message
    });
  }
};

// Create subject
const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      class_id,
      description,
      theory_marks,
      practical_marks,
      pass_marks,
      type,
      status
    } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }
    
    // Check if subject code already exists
    const [existing] = await pool.query(
      'SELECT id FROM subjects WHERE code = ?',
      [code]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Subject code already exists'
      });
    }
    
    const [result] = await pool.query(
      `INSERT INTO subjects (
        name, code, class_id, description, theory_marks, practical_marks, 
        pass_marks, type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        code, 
        class_id || null, 
        description || null, 
        theory_marks || 70, 
        practical_marks || 30, 
        pass_marks || 35, 
        type || 'core', 
        status || 'active'
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: {
        id: result.insertId,
        name,
        code
      }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: error.message
    });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if subject exists
    const [existing] = await pool.query('SELECT id FROM subjects WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // If updating code, check if new code is unique
    if (updateData.code) {
      const [duplicate] = await pool.query(
        'SELECT id FROM subjects WHERE code = ? AND id != ?',
        [updateData.code, id]
      );
      
      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Subject code already exists'
        });
      }
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
      `UPDATE subjects SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    res.json({
      success: true,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject',
      error: error.message
    });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subject is assigned to any teacher
    const [assignments] = await pool.query(
      'SELECT COUNT(*) as count FROM teacher_class_assignments WHERE subject_id = ?',
      [id]
    );
    
    if (assignments[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject. It is assigned to teachers. Please remove assignments first.'
      });
    }
    
    await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: error.message
    });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};