const pool = require("../config/database");
const { createNotification } = require("./notificationsController");

// Calculate grade based on percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C+";
  if (percentage >= 40) return "C";
  if (percentage >= 33) return "D";
  return "F";
};

// Get all results for an exam
const getExamResults = async (req, res) => {
  try {
    const { id: examId } = req.params;
    const { subject_id } = req.query;

    let query = `
      SELECT 
        er.*,
        s.first_name,
        s.last_name,
        s.admission_number,
        s.roll_number,
        sub.name as subject_name,
        sub.code as subject_code,
        u.email as entered_by_email
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      JOIN subjects sub ON er.subject_id = sub.id
      LEFT JOIN users u ON er.entered_by = u.id
      WHERE er.exam_id = ?
    `;

    const params = [examId];

    if (subject_id) {
      query += " AND er.subject_id = ?";
      params.push(subject_id);
    }

    query += " ORDER BY s.roll_number, sub.name";

    const [results] = await pool.query(query, params);

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get exam results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam results",
      error: error.message,
    });
  }
};

// Get student's results for an exam
const getStudentResults = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    const [results] = await pool.query(
      `SELECT 
        er.*,
        sub.name as subject_name,
        sub.code as subject_code
      FROM exam_results er
      JOIN subjects sub ON er.subject_id = sub.id
      WHERE er.exam_id = ? AND er.student_id = ?
      ORDER BY sub.name`,
      [examId, studentId]
    );

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Get student results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student results",
      error: error.message,
    });
  }
};

// Bulk enter/update results
const enterResults = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id: examId } = req.params;
    const { results } = req.body; // Array of { student_id, subject_id, marks_obtained, max_marks, remarks }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Results array is required",
      });
    }

    await connection.beginTransaction();

    const insertedResults = [];
    const updatedResults = [];

    for (const result of results) {
      const { student_id, subject_id, marks_obtained, max_marks, remarks } =
        result;

      // Validate marks
      if (marks_obtained > max_marks) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Marks obtained (${marks_obtained}) cannot exceed max marks (${max_marks}) for student ${student_id}`,
        });
      }

      // Calculate grade
      const percentage = (marks_obtained / max_marks) * 100;
      const grade = calculateGrade(percentage);

      // Check if result already exists
      const [existing] = await connection.query(
        "SELECT id FROM exam_results WHERE exam_id = ? AND student_id = ? AND subject_id = ?",
        [examId, student_id, subject_id]
      );

      if (existing.length > 0) {
        // Update existing result
        await connection.query(
          `UPDATE exam_results 
           SET marks_obtained = ?, max_marks = ?, grade = ?, remarks = ?, entered_by = ?
           WHERE id = ?`,
          [
            marks_obtained,
            max_marks,
            grade,
            remarks || null,
            req.user.id,
            existing[0].id,
          ]
        );
        updatedResults.push(existing[0].id);
      } else {
        // Insert new result
        const [insertResult] = await connection.query(
          `INSERT INTO exam_results 
           (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, remarks, entered_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            examId,
            student_id,
            subject_id,
            marks_obtained,
            max_marks,
            grade,
            remarks || null,
            req.user.id,
          ]
        );
        insertedResults.push(insertResult.insertId);

        // Notify student
        createNotification(
          req,
          student_id,
          "Exam Result Published",
          `Your result for exam ID ${examId} has been published. You scored ${marks_obtained}/${max_marks} (${grade}).`,
          "info",
          `/exams/${examId}/results`
        ).catch((err) =>
          console.error("Error sending result notification:", err)
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Results saved successfully",
      data: {
        inserted: insertedResults.length,
        updated: updatedResults.length,
        total: results.length,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Enter results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save results",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Update single result
const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained, max_marks, remarks } = req.body;

    // Validate marks
    if (marks_obtained > max_marks) {
      return res.status(400).json({
        success: false,
        message: "Marks obtained cannot exceed max marks",
      });
    }

    // Calculate grade
    const percentage = (marks_obtained / max_marks) * 100;
    const grade = calculateGrade(percentage);

    const [result] = await pool.query(
      `UPDATE exam_results 
       SET marks_obtained = ?, max_marks = ?, grade = ?, remarks = ?, entered_by = ?
       WHERE id = ?`,
      [marks_obtained, max_marks, grade, remarks || null, req.user.id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.json({
      success: true,
      message: "Result updated successfully",
    });
  } catch (error) {
    console.error("Update result error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update result",
      error: error.message,
    });
  }
};

// Delete result
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM exam_results WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error("Delete result error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete result",
      error: error.message,
    });
  }
};

module.exports = {
  getExamResults,
  getStudentResults,
  enterResults,
  updateResult,
  deleteResult,
};
