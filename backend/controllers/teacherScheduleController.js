const pool = require('../config/database');

// ---------------------
// GET TEACHER SCHEDULE
// ---------------------
const getTeacherSchedule = async (req, res) => {
  try {
    const { id } = req.params; // teacher_id
    const { day_of_week, academic_year } = req.query;

    let query = `
      SELECT tt.*, 
        c.name AS class_name, 
        sec.name AS section_name, 
        s.name AS subject_name
      FROM timetable tt
      LEFT JOIN classes c ON tt.class_id = c.id
      LEFT JOIN sections sec ON tt.section_id = sec.id
      LEFT JOIN subjects s ON tt.subject_id = s.id
      WHERE tt.teacher_id = ? AND tt.is_active = 1
    `;
    const params = [id];

    if (day_of_week) {
      query += " AND tt.day_of_week = ?";
      params.push(day_of_week);
    }

    if (academic_year) {
      query += " AND tt.academic_year = ?";
      params.push(academic_year);
    }

    query += " ORDER BY FIELD(tt.day_of_week, 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), tt.period_number";

    const [schedule] = await pool.query(query, params);
    res.json({ success: true, count: schedule.length, data: schedule });
  } catch (err) {
    console.error("Get teacher schedule error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch schedule", error: err.message });
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
        sec.name AS section_name, 
        s.name AS subject_name
      FROM timetable tt
      LEFT JOIN classes c ON tt.class_id = c.id
      LEFT JOIN sections sec ON tt.section_id = sec.id
      LEFT JOIN subjects s ON tt.subject_id = s.id
      WHERE tt.id = ? AND tt.is_active = 1
    `;

    const [periods] = await pool.query(query, [id]);

    if (!periods.length) {
      return res.status(404).json({ success: false, message: "Period not found" });
    }

    res.json({ success: true, data: periods[0] });
  } catch (err) {
    console.error("Get schedule detail error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch period detail", error: err.message });
  }
};

// ---------------------
// EXPORT
// ---------------------
module.exports = {
  getTeacherSchedule,
  getScheduleDetail,
};
