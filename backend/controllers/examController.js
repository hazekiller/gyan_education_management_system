const pool = require("../config/database");

// Get all exams with class information
const getAllExams = async (req, res) => {
  try {
    const { academic_year } = req.query;

    let query = `
      SELECT 
        exams.*,
        classes.name as class_name
      FROM exams
      LEFT JOIN classes ON exams.class_id = classes.id
    `;

    const params = [];

    if (academic_year) {
      query += " WHERE exams.academic_year = ?";
      params.push(academic_year);
    }

    query += " ORDER BY exams.start_date DESC";

    const [exams] = await pool.query(query, params);

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
      created_by,
    } = req.body;

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
};
