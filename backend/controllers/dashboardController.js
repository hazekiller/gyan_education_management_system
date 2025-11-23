const pool = require("../config/database");

// Get recent registrations
const getRecentRegistrations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent students
    const [students] = await pool.query(
      `
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.admission_number,
        c.name as class_name,
        sec.name as section_name,
        s.created_at,
        'student' as type,
        s.profile_photo
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT ?
    `,
      [Math.floor(limit / 2)]
    );

    // Get recent teachers
    const [teachers] = await pool.query(
      `
      SELECT 
        t.id,
        t.first_name,
        t.last_name,
        t.employee_id as admission_number,
        t.specialization as class_name,
        NULL as section_name,
        t.created_at,
        'teacher' as type,
        t.profile_photo
      FROM teachers t
      WHERE t.status = 'active'
      ORDER BY t.created_at DESC
      LIMIT ?
    `,
      [Math.floor(limit / 2)]
    );

    // Combine and sort by created_at
    const registrations = [...students, ...teachers]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Get recent registrations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent registrations",
      error: error.message,
    });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [studentCount] = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE status = "active"'
    );
    const [teacherCount] = await pool.query(
      'SELECT COUNT(*) as count FROM teachers WHERE status = "active"'
    );
    const [classCount] = await pool.query(
      "SELECT COUNT(*) as count FROM classes WHERE is_active = 1"
    );
    const [staffCount] = await pool.query(
      'SELECT COUNT(*) as count FROM staff WHERE status = "active"'
    );

    // Get today's attendance
    const today = new Date().toISOString().split("T")[0];
    const [attendanceStats] = await pool.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM attendance
      WHERE date = ?
    `,
      [today]
    );

    res.json({
      success: true,
      data: {
        students: studentCount[0].count,
        teachers: teacherCount[0].count,
        classes: classCount[0].count,
        staff: staffCount[0].count,
        todayAttendance: {
          total: attendanceStats[0].total || 0,
          present: attendanceStats[0].present || 0,
          absent: attendanceStats[0].absent || 0,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

module.exports = {
  getRecentRegistrations,
  getDashboardStats,
};
