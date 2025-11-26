const db = require("../config/database");

// GET all assignments
const getAllAssignments = async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT a.*, c.name as class_name, sec.name as section_name, s.name as subject_name
      FROM assignments a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      LEFT JOIN subjects s ON a.subject_id = s.id
      ORDER BY a.due_date DESC
    `);

    // Convert attachments JSON to array
    const formatted = assignments.map((a) => ({
      ...a,
      attachments: a.attachments ? JSON.parse(a.attachments) : [],
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Get Assignments Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      class_id,
      section_id,
      subject_id,
      due_date,
      total_marks,
    } = req.body;

    if (!title || !class_id || !section_id || !due_date) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    // Determine created_by based on user role
    let created_by;

    if (req.user.role === "admin" || req.user.role === "super_admin") {
      // Admin/Super Admin creates on behalf of a specific teacher
      if (req.body.teacher_id) {
        created_by = req.body.teacher_id;
      } else {
        // Use a default/system teacher account
        const [teachers] = await db.query("SELECT id FROM teachers LIMIT 1");
        if (teachers.length === 0) {
          return res.status(400).json({
            success: false,
            message:
              "No teachers available. Please create a teacher account first.",
          });
        }
        created_by = teachers[0].id;
      }
    } else if (req.user.role === "teacher") {
      // Teacher creates their own assignment
      // FIXED: Get teacher.id from teachers table using user_id
      const [teachers] = await db.query(
        "SELECT id FROM teachers WHERE user_id = ?",
        [req.user.id]
      );

      if (teachers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Teacher profile not found. Please contact administrator.",
        });
      }

      created_by = teachers[0].id; // This is the actual teacher.id from teachers table
    } else {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create assignments",
      });
    }

    // Verify the teacher exists
    const [teacher] = await db.query("SELECT id FROM teachers WHERE id = ?", [
      created_by,
    ]);
    if (teacher.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    const attachments =
      req.files && req.files.length > 0
        ? JSON.stringify(req.files.map((f) => f.path))
        : null;

    const [result] = await db.query(
      `INSERT INTO assignments 
        (title, description, class_id, section_id, subject_id, due_date, total_marks, attachments, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || "",
        class_id,
        section_id,
        subject_id || null,
        due_date,
        total_marks || 100,
        attachments,
        created_by,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: {
        id: result.insertId,
        title,
        description,
        class_id,
        section_id,
        subject_id,
        due_date,
        total_marks: total_marks || 100,
        attachments: attachments ? JSON.parse(attachments) : [],
        created_by: created_by,
      },
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM assignments WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });

    const assignment = rows[0];
    assignment.attachments = assignment.attachments
      ? JSON.parse(assignment.attachments)
      : [];

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error("Get Assignment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE assignment
const updateAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      class_id,
      section_id,
      subject_id,
      due_date,
      total_marks,
    } = req.body;

    // Get existing assignment
    const [rows] = await db.query("SELECT * FROM assignments WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });

    const oldAttachments = rows[0].attachments
      ? JSON.parse(rows[0].attachments)
      : [];
    const newAttachments =
      req.files && req.files.length > 0 ? req.files.map((f) => f.path) : [];

    const combinedAttachments = [...oldAttachments, ...newAttachments];

    await db.query(
      `UPDATE assignments SET 
        title = ?, description = ?, class_id = ?, section_id = ?, subject_id = ?, due_date = ?, total_marks = ?, attachments = ?
       WHERE id = ?`,
      [
        title || rows[0].title,
        description || rows[0].description,
        class_id || rows[0].class_id,
        section_id || rows[0].section_id,
        subject_id || rows[0].subject_id,
        due_date || rows[0].due_date,
        total_marks || rows[0].total_marks,
        JSON.stringify(combinedAttachments),
        req.params.id,
      ]
    );

    res.json({
      success: true,
      message: "Assignment updated successfully",
      attachments: combinedAttachments,
    });
  } catch (error) {
    console.error("Update Assignment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE assignment
const deleteAssignment = async (req, res) => {
  try {
    await db.query("DELETE FROM assignments WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Delete Assignment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
