const db = require("../config/database");

// Submit assignment (Student)
const submitAssignment = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const { submission_text } = req.body;

    // Get student ID from user
    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const studentId = students[0].id;

    // Check if assignment exists
    const [assignments] = await db.query(
      "SELECT * FROM assignments WHERE id = ?",
      [assignmentId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const assignment = assignments[0];

    // Check if already submitted
    const [existing] = await db.query(
      "SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?",
      [assignmentId, studentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted this assignment. Use update instead.",
      });
    }

    // Check if late
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const status = now > dueDate ? "late" : "submitted";

    // Handle file attachments
    const attachments =
      req.files && req.files.length > 0
        ? JSON.stringify(req.files.map((f) => f.path))
        : null;

    // Insert submission
    const [result] = await db.query(
      `INSERT INTO assignment_submissions 
       (assignment_id, student_id, submission_text, attachments, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [assignmentId, studentId, submission_text || "", attachments, status]
    );

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: {
        id: result.insertId,
        assignment_id: assignmentId,
        student_id: studentId,
        status,
        submitted_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all submissions for an assignment (Teacher/Admin)
const getSubmissions = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;

    const [submissions] = await db.query(
      `SELECT 
        asub.*,
        s.first_name,
        s.last_name,
        s.admission_number,
        s.roll_number,
        grader.email as graded_by_email
      FROM assignment_submissions asub
      JOIN students s ON asub.student_id = s.id
      LEFT JOIN users grader ON asub.graded_by = grader.id
      WHERE asub.assignment_id = ?
      ORDER BY asub.submitted_at DESC`,
      [assignmentId]
    );

    // Parse attachments JSON
    const formatted = submissions.map((sub) => ({
      ...sub,
      attachments: sub.attachments ? JSON.parse(sub.attachments) : [],
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's own submission
const getMySubmission = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;

    // Get student ID
    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const studentId = students[0].id;

    const [submissions] = await db.query(
      `SELECT 
        asub.*,
        grader.email as graded_by_email
      FROM assignment_submissions asub
      LEFT JOIN users grader ON asub.graded_by = grader.id
      WHERE asub.assignment_id = ? AND asub.student_id = ?`,
      [assignmentId, studentId]
    );

    if (submissions.length === 0) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const submission = submissions[0];
    submission.attachments = submission.attachments
      ? JSON.parse(submission.attachments)
      : [];

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Get my submission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Grade submission (Teacher/Admin)
const gradeSubmission = async (req, res) => {
  try {
    const { id: submissionId } = req.params;
    const { marks_obtained, feedback } = req.body;

    // Validate marks
    if (marks_obtained === undefined || marks_obtained === null) {
      return res.status(400).json({
        success: false,
        message: "Marks are required",
      });
    }

    // Check if submission exists
    const [submissions] = await db.query(
      "SELECT * FROM assignment_submissions WHERE id = ?",
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Update submission
    await db.query(
      `UPDATE assignment_submissions 
       SET marks_obtained = ?, feedback = ?, status = 'graded', 
           graded_at = NOW(), graded_by = ?
       WHERE id = ?`,
      [marks_obtained, feedback || "", req.user.id, submissionId]
    );

    res.json({
      success: true,
      message: "Submission graded successfully",
    });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update submission (Student - before grading)
const updateSubmission = async (req, res) => {
  try {
    const { id: submissionId } = req.params;
    const { submission_text } = req.body;

    // Get student ID
    const [students] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const studentId = students[0].id;

    // Check if submission exists and belongs to student
    const [submissions] = await db.query(
      "SELECT * FROM assignment_submissions WHERE id = ? AND student_id = ?",
      [submissionId, studentId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const submission = submissions[0];

    // Check if already graded
    if (submission.status === "graded") {
      return res.status(400).json({
        success: false,
        message: "Cannot update graded submission",
      });
    }

    // Handle new attachments
    const oldAttachments = submission.attachments
      ? JSON.parse(submission.attachments)
      : [];
    const newAttachments =
      req.files && req.files.length > 0 ? req.files.map((f) => f.path) : [];
    const combinedAttachments = [...oldAttachments, ...newAttachments];

    // Update submission
    await db.query(
      `UPDATE assignment_submissions 
       SET submission_text = ?, attachments = ?
       WHERE id = ?`,
      [
        submission_text || submission.submission_text,
        JSON.stringify(combinedAttachments),
        submissionId,
      ]
    );

    res.json({
      success: true,
      message: "Submission updated successfully",
    });
  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  updateSubmission,
};
