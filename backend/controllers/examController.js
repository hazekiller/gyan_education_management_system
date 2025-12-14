const pool = require("../config/database");
const { createNotification } = require("./notificationsController");

// Get all exams with class information
const getAllExams = async (req, res) => {
  try {
    const { academic_year } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query = `
      SELECT 
        exams.*,
        classes.name as class_name
      FROM exams
      LEFT JOIN classes ON exams.class_id = classes.id
      WHERE 1=1
    `;

    const params = [];

    // Role-based filtering
    if (userRole === "student") {
      // Students: Only see exams for their assigned class
      const [students] = await pool.query(
        "SELECT class_id FROM students WHERE user_id = ?",
        [userId]
      );

      if (students.length > 0 && students[0].class_id) {
        query += " AND exams.class_id = ?";
        params.push(students[0].class_id);
      } else {
        // Student has no class assigned, return empty
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    } else if (userRole === "teacher") {
      // Teachers: See exams for classes they teach
      const [teachers] = await pool.query(
        "SELECT id FROM teachers WHERE user_id = ?",
        [userId]
      );

      if (teachers.length > 0) {
        query += ` AND exams.class_id IN (
          SELECT DISTINCT class_id FROM class_subjects 
          WHERE teacher_id = ? AND is_active = 1
        )`;
        params.push(teachers[0].id);
      } else {
        // Teacher profile not found, return empty
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }
    // Admin/Principal/Higher roles: See all exams (no additional filter)

    if (academic_year) {
      query += " AND exams.academic_year = ?";
      params.push(academic_year);
    }

    query += " ORDER BY exams.start_date DESC";

    const [exams] = await pool.query(query, params);
    console.log(`Found ${exams.length} exams`);

    res.json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    console.error("Get exams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};

// Get exam by ID with class information
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        exams.*,
        classes.name as class_name
      FROM exams
      LEFT JOIN classes ON exams.class_id = classes.id
      WHERE exams.id = ?
    `;

    const [exam] = await pool.query(query, [id]);

    if (exam.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.json({
      success: true,
      data: exam[0], // Return single object, not array
    });
  } catch (error) {
    console.error("Get exam error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam",
      error: error.message,
    });
  }
};

// Create exam
const createExam = async (req, res) => {
  try {
    const {
      name,
      exam_type,
      class_id,
      academic_year,
      start_date,
      end_date,
      total_marks,
      passing_marks,
      description,
    } = req.body;

    const created_by = req.body.created_by || req.user?.id;

    const [result] = await pool.query(
      `INSERT INTO exams (name, exam_type, class_id, academic_year, start_date, end_date, 
       total_marks, passing_marks, description, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        exam_type,
        class_id,
        academic_year,
        start_date,
        end_date,
        total_marks,
        passing_marks,
        description,
        created_by,
      ]
    );

    // Fetch the created exam with class information
    const [createdExam] = await pool.query(
      `SELECT 
        exams.*,
        classes.name as class_name
      FROM exams
      LEFT JOIN classes ON exams.class_id = classes.id
      WHERE exams.id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      data: createdExam[0],
    });

    // Notify students in the class
    try {
      const [students] = await pool.query(
        "SELECT user_id FROM students WHERE class_id = ? AND status = 'active'",
        [class_id]
      );

      const notificationPromises = students.map((student) =>
        createNotification(
          req,
          student.user_id,
          "New Exam Scheduled",
          `A new exam "${name}" has been scheduled starting on ${new Date(
            start_date
          ).toLocaleDateString()}.`,
          "info",
          `/exams/${result.insertId}`
        )
      );

      await Promise.all(notificationPromises);
    } catch (notifyError) {
      console.error("Failed to notify students about new exam:", notifyError);
    }
  } catch (error) {
    console.error("Create exam error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create exam",
      error: error.message,
    });
  }
};

// Update exam
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      exam_type,
      class_id,
      academic_year,
      start_date,
      end_date,
      total_marks,
      passing_marks,
      description,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE exams SET name = ?, exam_type = ?, class_id = ?, academic_year = ?, 
       start_date = ?, end_date = ?, total_marks = ?, passing_marks = ?, description = ? 
       WHERE id = ?`,
      [
        name,
        exam_type,
        class_id,
        academic_year,
        start_date,
        end_date,
        total_marks,
        passing_marks,
        description,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Fetch the updated exam with class information
    const [updatedExam] = await pool.query(
      `SELECT 
        exams.*,
        classes.name as class_name
      FROM exams
      LEFT JOIN classes ON exams.class_id = classes.id
      WHERE exams.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updatedExam[0],
    });
  } catch (error) {
    console.error("Update exam error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update exam",
      error: error.message,
    });
  }
};

// Get distinct academic years from exams
const getAcademicYears = async (req, res) => {
  try {
    const [years] = await pool.query(
      `SELECT DISTINCT academic_year 
       FROM exams 
       WHERE academic_year IS NOT NULL 
       ORDER BY academic_year DESC`
    );

    res.json({
      success: true,
      data: years.map((y) => y.academic_year),
    });
  } catch (error) {
    console.error("Get academic years error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch academic years",
      error: error.message,
    });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM exams WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }
    res.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete exam",
      error: error.message,
    });
  }
};

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getAcademicYears,
};
