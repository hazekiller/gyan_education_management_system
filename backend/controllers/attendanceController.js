const pool = require('../config/database');

// Get attendance records
const getAttendance = async (req, res) => {
  try {
    const { class_id, section_id, student_id, date, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        a.*,
        s.first_name,
        s.last_name,
        s.roll_number,
        c.name as class_name,
        sec.name as section_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(class_id);
    }
    
    if (section_id) {
      query += ' AND s.section_id = ?';
      params.push(section_id);
    }
    
    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    } else {
      if (start_date) {
        query += ' AND a.date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        query += ' AND a.date <= ?';
        params.push(end_date);
      }
    }
    
    query += ' ORDER BY a.date DESC, s.roll_number';
    
    const [attendance] = await pool.query(query, params);
    
    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};

// Mark attendance for students
const markAttendance = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { date, attendance_records } = req.body;
    const marked_by = req.user.id;
    
    if (!date || !attendance_records || !Array.isArray(attendance_records)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Date and attendance records array are required'
      });
    }
    
    // Check if attendance already exists for this date
    const existingIds = attendance_records.map(r => r.student_id);
    const placeholders = existingIds.map(() => '?').join(',');
    
    const [existing] = await connection.query(
      `SELECT student_id FROM attendance WHERE date = ? AND student_id IN (${placeholders})`,
      [date, ...existingIds]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for some students on this date'
      });
    }
    
    // Insert attendance records
    const values = attendance_records.map(record => [
      record.student_id,
      date,
      record.status || 'present',
      record.remarks || null,
      marked_by
    ]);
    
    await connection.query(
      `INSERT INTO attendance (student_id, date, status, remarks, marked_by) VALUES ?`,
      [values]
    );
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: `Attendance marked for ${attendance_records.length} students`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: present, absent, late, or excused'
      });
    }
    
    const [result] = await pool.query(
      `UPDATE attendance SET status = ?, remarks = ?, updated_at = NOW() WHERE id = ?`,
      [status, remarks || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance',
      error: error.message
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance',
      error: error.message
    });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const { class_id, section_id, student_id, start_date, end_date } = req.query;
    
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
    
    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(class_id);
    }
    
    if (section_id) {
      query += ' AND s.section_id = ?';
      params.push(section_id);
    }
    
    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    
    if (start_date) {
      query += ' AND a.date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND a.date <= ?';
      params.push(end_date);
    }
    
    const [stats] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats
}; 