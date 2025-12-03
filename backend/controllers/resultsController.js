const pool = require("../config/database");
const PDFDocument = require("pdfkit");

// Get all exam results for a student
const getStudentAllResults = async (req, res) => {
  try {
    let { studentId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // For students, automatically use their student ID
    if (userRole === "student") {
      const [students] = await pool.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userId]
      );

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Override studentId with the actual student record ID
      studentId = students[0].id;
    } else if (
      userRole !== "admin" &&
      userRole !== "super_admin" &&
      userRole !== "principal"
    ) {
      // Teachers and other roles need explicit permission
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view student results",
      });
    }

    // Get student info
    const [students] = await pool.query(
      `SELECT s.*, c.name as class_name, sec.name as section_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN sections sec ON s.section_id = sec.id
       WHERE s.id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = students[0];

    // Get all exams for student's class
    const [exams] = await pool.query(
      `SELECT e.*, 
        (SELECT COUNT(*) FROM exam_results WHERE exam_id = e.id AND student_id = ?) as results_count,
        (SELECT SUM(marks_obtained) FROM exam_results WHERE exam_id = e.id AND student_id = ?) as total_marks_obtained,
        (SELECT SUM(max_marks) FROM exam_results WHERE exam_id = e.id AND student_id = ?) as total_max_marks
       FROM exams e
       WHERE e.class_id = ?
       ORDER BY e.start_date DESC`,
      [studentId, studentId, studentId, student.class_id]
    );

    // Calculate percentage and status for each exam
    const examsWithResults = exams.map((exam) => {
      const percentage =
        exam.total_max_marks > 0
          ? ((exam.total_marks_obtained / exam.total_max_marks) * 100).toFixed(
              2
            )
          : 0;

      return {
        ...exam,
        percentage,
        status: exam.results_count > 0 ? "published" : "pending",
      };
    });

    res.json({
      success: true,
      data: {
        student,
        exams: examsWithResults,
      },
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

// Get student results for a specific exam
const getStudentExamResults = async (req, res) => {
  try {
    let { studentId, examId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // For students, automatically use their student ID
    if (userRole === "student") {
      const [students] = await pool.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userId]
      );

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Override studentId with the actual student record ID
      studentId = students[0].id;
    } else if (
      userRole !== "admin" &&
      userRole !== "super_admin" &&
      userRole !== "principal"
    ) {
      // Teachers and other roles need explicit permission
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view student results",
      });
    }

    // Get student info
    const [students] = await pool.query(
      `SELECT s.*, c.name as class_name, sec.name as section_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN sections sec ON s.section_id = sec.id
       WHERE s.id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = students[0];

    // Get exam info
    const [exams] = await pool.query("SELECT * FROM exams WHERE id = ?", [
      examId,
    ]);

    if (exams.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const exam = exams[0];

    // Get subject results for this exam
    const [results] = await pool.query(
      `SELECT er.*, sub.name as subject_name, sub.code as subject_code
       FROM exam_results er
       JOIN subjects sub ON er.subject_id = sub.id
       WHERE er.exam_id = ? AND er.student_id = ?
       ORDER BY sub.name`,
      [examId, studentId]
    );

    // Calculate totals
    const totalMarksObtained = results.reduce(
      (sum, r) => sum + parseFloat(r.marks_obtained),
      0
    );
    const totalMaxMarks = results.reduce(
      (sum, r) => sum + parseInt(r.max_marks),
      0
    );
    const percentage =
      totalMaxMarks > 0
        ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)
        : 0;

    // Calculate overall grade
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

    const overallGrade = calculateGrade(parseFloat(percentage));

    res.json({
      success: true,
      data: {
        student,
        exam,
        results,
        summary: {
          totalMarksObtained,
          totalMaxMarks,
          percentage,
          overallGrade,
          status: results.length > 0 ? "published" : "pending",
        },
      },
    });
  } catch (error) {
    console.error("Get student exam results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam results",
      error: error.message,
    });
  }
};

// Generate PDF marksheet for a student's exam
const generateResultPDF = async (req, res) => {
  try {
    let { studentId, examId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // For students, automatically use their student ID
    if (userRole === "student") {
      const [students] = await pool.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userId]
      );

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Override studentId with the actual student record ID
      studentId = students[0].id;
    } else if (
      userRole !== "admin" &&
      userRole !== "super_admin" &&
      userRole !== "principal"
    ) {
      // Teachers and other roles need explicit permission
      return res.status(403).json({
        success: false,
        message: "You don't have permission to download student results",
      });
    }

    // Get student info
    const [students] = await pool.query(
      `SELECT s.*, c.name as class_name, sec.name as section_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN sections sec ON s.section_id = sec.id
       WHERE s.id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = students[0];

    // Get exam info
    const [exams] = await pool.query("SELECT * FROM exams WHERE id = ?", [
      examId,
    ]);

    if (exams.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const exam = exams[0];

    // Get subject results
    const [results] = await pool.query(
      `SELECT er.*, sub.name as subject_name, sub.code as subject_code
       FROM exam_results er
       JOIN subjects sub ON er.subject_id = sub.id
       WHERE er.exam_id = ? AND er.student_id = ?
       ORDER BY sub.name`,
      [examId, studentId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No results found for this exam",
      });
    }

    // Calculate totals
    const totalMarksObtained = results.reduce(
      (sum, r) => sum + parseFloat(r.marks_obtained),
      0
    );
    const totalMaxMarks = results.reduce(
      (sum, r) => sum + parseInt(r.max_marks),
      0
    );
    const percentage = ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2);

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

    const overallGrade = calculateGrade(parseFloat(percentage));

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=marksheet_${
        student.admission_number
      }_${exam.name.replace(/\s+/g, "_")}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("GYAN EDUCATION MANAGEMENT SYSTEM", { align: "center" });
    doc.fontSize(16).text("STUDENT MARKSHEET", { align: "center" });
    doc.moveDown();

    // Exam Details
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Exam: ${exam.name}`, { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Type: ${exam.exam_type} | Academic Year: ${exam.academic_year}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Student Details
    doc.fontSize(11).font("Helvetica-Bold").text("Student Details:");
    doc.fontSize(10).font("Helvetica");
    doc.text(
      `Name: ${student.first_name} ${student.middle_name || ""} ${
        student.last_name
      }`
    );
    doc.text(`Admission Number: ${student.admission_number}`);
    doc.text(`Roll Number: ${student.roll_number || "N/A"}`);
    doc.text(`Class: ${student.class_name} - ${student.section_name}`);
    doc.moveDown(2);

    // Results Table
    doc.fontSize(11).font("Helvetica-Bold").text("Subject-wise Performance:");
    doc.moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 200;
    const col3X = 320;
    const col4X = 400;
    const col5X = 480;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Subject", col1X, tableTop);
    doc.text("Code", col2X, tableTop);
    doc.text("Marks Obtained", col3X, tableTop);
    doc.text("Max Marks", col4X, tableTop);
    doc.text("Grade", col5X, tableTop);

    // Draw line under headers
    doc
      .moveTo(col1X, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    // Table rows
    let yPosition = tableTop + 25;
    doc.font("Helvetica");

    results.forEach((result, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(result.subject_name, col1X, yPosition);
      doc.text(result.subject_code, col2X, yPosition);
      doc.text(result.marks_obtained.toString(), col3X, yPosition);
      doc.text(result.max_marks.toString(), col4X, yPosition);
      doc.text(result.grade, col5X, yPosition);

      yPosition += 20;
    });

    // Draw line before totals
    doc.moveTo(col1X, yPosition).lineTo(545, yPosition).stroke();
    yPosition += 10;

    // Totals
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Total", col1X, yPosition);
    doc.text(totalMarksObtained.toFixed(2), col3X, yPosition);
    doc.text(totalMaxMarks.toString(), col4X, yPosition);
    doc.text(overallGrade, col5X, yPosition);

    yPosition += 25;

    // Percentage and Grade
    doc.fontSize(12);
    doc.text(`Percentage: ${percentage}%`, col1X, yPosition);
    doc.text(`Overall Grade: ${overallGrade}`, col3X, yPosition);

    yPosition += 40;

    // Result Status
    const isPassed = parseFloat(percentage) >= exam.passing_marks;
    doc.fontSize(14).font("Helvetica-Bold");
    doc.fillColor(isPassed ? "green" : "red");
    doc.text(isPassed ? "PASSED" : "FAILED", { align: "center" });
    doc.fillColor("black");

    yPosition += 40;

    // Remarks section
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Remarks: _______________________________________________",
      col1X,
      yPosition
    );
    yPosition += 40;

    // Signature section
    doc.text("Class Teacher Signature: _______________", col1X, yPosition);
    doc.text("Principal Signature: _______________", 350, yPosition);

    yPosition += 40;

    // Footer
    doc.fontSize(8).font("Helvetica").fillColor("gray");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });
    doc.text("This is a computer-generated document", { align: "center" });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Generate PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentAllResults,
  getStudentExamResults,
  generateResultPDF,
};
