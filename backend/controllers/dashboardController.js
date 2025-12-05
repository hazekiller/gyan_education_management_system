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

// Get teacher-specific dashboard stats
const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    // 1. Get teacher's assigned classes and sections from timetable
    const [teacherClasses] = await pool.query(
      `
      SELECT DISTINCT 
        t.class_id,
        t.section_id,
        c.name as class_name,
        c.grade_level,
        s.name as section_name
      FROM timetable t
      JOIN classes c ON t.class_id = c.id
      JOIN sections s ON t.section_id = s.id
      WHERE t.teacher_id = ? AND t.is_active = 1
    `,
      [teacherId]
    );

    if (teacherClasses.length === 0) {
      return res.json({
        success: true,
        data: {
          classes: 0,
          students: 0,
          subjects: 0,
          todayAttendance: { total: 0, present: 0, absent: 0 },
          pendingAssignments: 0,
          upcomingEvents: [],
        },
      });
    }

    // Extract section IDs for filtering
    const sectionIds = teacherClasses.map((tc) => tc.section_id);

    // 2. Count students in teacher's sections
    const [studentCount] = await pool.query(
      `
      SELECT COUNT(DISTINCT s.id) as count
      FROM students s
      WHERE s.section_id IN (?) AND s.status = 'active'
    `,
      [sectionIds]
    );

    // 3. Get unique subjects taught by the teacher
    const [subjectCount] = await pool.query(
      `
      SELECT COUNT(DISTINCT subject_id) as count
      FROM timetable
      WHERE teacher_id = ? AND is_active = 1
    `,
      [teacherId]
    );

    // 4. Get today's attendance for teacher's sections
    const today = new Date().toISOString().split("T")[0];
    const [attendanceStats] = await pool.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM attendance
      WHERE section_id IN (?) AND date = ?
    `,
      [sectionIds, today]
    );

    // 5. Count pending assignments (submissions that need grading)
    const [pendingAssignments] = await pool.query(
      `
      SELECT COUNT(*) as count
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE a.created_by = ? 
        AND asub.status IN ('submitted', 'late')
        AND asub.marks_obtained IS NULL
    `,
      [teacherId]
    );

    // 6. Get upcoming events (next 5 events)
    const [upcomingEvents] = await pool.query(
      `
      SELECT 
        id,
        title,
        event_date,
        event_type,
        description
      FROM events
      WHERE is_active = 1 
        AND event_date >= CURDATE()
        AND (target_audience IN ('all', 'teachers') 
          OR target_audience = 'specific_class')
      ORDER BY event_date ASC
      LIMIT 5
    `
    );

    // 7. Get announcements for teachers
    const [announcements] = await pool.query(
      `
      SELECT 
        id,
        title,
        content,
        priority,
        published_at
      FROM announcements
      WHERE is_active = 1
        AND (expires_at IS NULL OR expires_at > NOW())
        AND target_audience IN ('all', 'teachers')
      ORDER BY priority DESC, published_at DESC
      LIMIT 5
    `
    );

    res.json({
      success: true,
      data: {
        classes: teacherClasses.length,
        students: studentCount[0].count,
        subjects: subjectCount[0].count,
        todayAttendance: {
          total: attendanceStats[0].total || 0,
          present: attendanceStats[0].present || 0,
          absent: attendanceStats[0].absent || 0,
        },
        pendingAssignments: pendingAssignments[0].count,
        upcomingEvents: upcomingEvents,
        announcements: announcements,
        teacherClasses: teacherClasses,
      },
    });
  } catch (error) {
    console.error("Get teacher dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher dashboard stats",
      error: error.message,
    });
  }
};

module.exports = {
  getRecentRegistrations,
  getDashboardStats,
  getTeacherDashboardStats,
};
