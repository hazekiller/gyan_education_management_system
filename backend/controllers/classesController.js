const pool = require("../config/database");

// ============= CLASS FUNCTIONS =============

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const { status, grade_level } = req.query;

    let query = `
      SELECT 
        c.*,
        CONCAT(t.first_name, ' ', t.last_name) as class_teacher_name,
        t.employee_id as teacher_employee_id,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(DISTINCT sec.id) as section_count,
        COUNT(DISTINCT tca.teacher_id) as subject_teacher_count
      FROM classes c
      LEFT JOIN teachers t ON c.class_teacher_id = t.id
      LEFT JOIN students s ON c.id = s.class_id
      LEFT JOIN sections sec ON c.id = sec.class_id
      LEFT JOIN teacher_class_assignments tca ON c.id = tca.class_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += " AND c.status = ?";
      params.push(status);
    }

    if (grade_level) {
      query += " AND c.grade_level = ?";
      params.push(grade_level);
    }

    query += " GROUP BY c.id ORDER BY c.grade_level, c.name";

    const [classes] = await pool.query(query, params);

    res.json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
      error: error.message,
    });
  }
};

// Get classes assigned to the logged-in user (role-based)
const getMyClasses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // If admin, return all classes
    const adminRoles = ["super_admin", "principal", "vice_principal", "hod"];
    if (adminRoles.includes(userRole)) {
      const [classes] = await pool.query(
        `SELECT DISTINCT c.* FROM classes c
         WHERE c.is_active = 1
         ORDER BY c.grade_level, c.name`
      );

      return res.json({
        success: true,
        count: classes.length,
        data: classes,
      });
    }

    // For teachers, get only their assigned classes (via sections)
    const [classes] = await pool.query(
      `SELECT DISTINCT c.* 
       FROM classes c
       JOIN sections s ON s.class_id = c.id
       JOIN teachers t ON s.class_teacher_id = t.id
       WHERE t.user_id = ? AND c.is_active = 1
       ORDER BY c.grade_level, c.name`,
      [userId]
    );

    res.json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    console.error("Get my classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
      error: error.message,
    });
  }
};

// Get sections for a specific class (filtered by teacher if applicable)
const getMySections = async (req, res) => {
  try {
    const { id } = req.params; // class_id
    const userId = req.user.id;
    const userRole = req.user.role;

    // If admin, return all sections
    const adminRoles = ["super_admin", "principal", "vice_principal", "hod"];
    if (adminRoles.includes(userRole)) {
      const [sections] = await pool.query(
        `SELECT 
          sec.*,
          CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
          t.employee_id as teacher_employee_id,
          COUNT(DISTINCT s.id) as student_count
        FROM sections sec
        LEFT JOIN teachers t ON sec.class_teacher_id = t.id
        LEFT JOIN students s ON sec.id = s.section_id
        WHERE sec.class_id = ? AND sec.is_active = 1
        GROUP BY sec.id
        ORDER BY sec.name`,
        [id]
      );

      return res.json({
        success: true,
        count: sections.length,
        data: sections,
      });
    }

    // For teachers, get only their assigned sections
    const [sections] = await pool.query(
      `SELECT 
        sec.*,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        t.employee_id as teacher_employee_id,
        COUNT(DISTINCT s.id) as student_count
      FROM sections sec
      JOIN teachers t ON sec.class_teacher_id = t.id
      LEFT JOIN students s ON sec.id = s.section_id
      WHERE sec.class_id = ? AND t.user_id = ? AND sec.is_active = 1
      GROUP BY sec.id
      ORDER BY sec.name`,
      [id, userId]
    );

    res.json({
      success: true,
      count: sections.length,
      data: sections,
    });
  } catch (error) {
    console.error("Get my sections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sections",
      error: error.message,
    });
  }
};

// Get class by ID with sections and teachers
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const [classes] = await pool.query(
      `
      SELECT c.*, 
        CONCAT(t.first_name, ' ', t.last_name) as class_teacher_name,
        t.employee_id as teacher_employee_id,
        t.phone as teacher_phone,
        u.email as teacher_email
      FROM classes c
      LEFT JOIN teachers t ON c.class_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE c.id = ?
    `,
      [id]
    );

    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Get sections for this class with their class teachers and subject teachers
    const [sections] = await pool.query(
      `
      SELECT 
        sec.*,
        CONCAT(t.first_name, ' ', t.last_name) as class_teacher_name,
        t.employee_id as teacher_employee_id,
        t.phone as teacher_phone,
        u.email as teacher_email,
        COUNT(DISTINCT s.id) as student_count
      FROM sections sec
      LEFT JOIN teachers t ON sec.class_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON sec.id = s.section_id AND s.class_id = ?
      WHERE sec.class_id = ?
      GROUP BY sec.id
      ORDER BY sec.name
    `,
      [id, id]
    );

    // For each section, get subject teachers
    for (let section of sections) {
      const [subjectTeachers] = await pool.query(
        `
        SELECT 
          sst.*,
          CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
          t.employee_id,
          u.email as teacher_email,
          subj.name as subject_name,
          subj.code as subject_code
        FROM section_subject_teachers sst
        JOIN teachers t ON sst.teacher_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        JOIN subjects subj ON sst.subject_id = subj.id
        WHERE sst.section_id = ? AND sst.is_active = 1
        ORDER BY subj.name
      `,
        [section.id]
      );
      section.subject_teachers = subjectTeachers;
    }

    // Get students count
    const [studentCount] = await pool.query(
      "SELECT COUNT(*) as count FROM students WHERE class_id = ?",
      [id]
    );

    // Get assigned subject teachers at class level (legacy)
    const [subjectTeachers] = await pool.query(
      `
      SELECT 
        tca.*,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        t.employee_id,
        u.email as teacher_email,
        s.name as subject_name,
        s.code as subject_code
      FROM teacher_class_assignments tca
      JOIN teachers t ON tca.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN subjects s ON tca.subject_id = s.id
      WHERE tca.class_id = ?
    `,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...classes[0],
        sections,
        student_count: studentCount[0].count,
        subject_teachers: subjectTeachers,
      },
    });
  } catch (error) {
    console.error("Get class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch class",
      error: error.message,
    });
  }
};

// Create class with sections
const createClass = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      name,
      grade_level,
      academic_year,
      class_teacher_id,
      room_number,
      capacity,
      status,
      description,
      sections, // Array of section names like ['A', 'B', 'C']
    } = req.body;

    if (!name || !grade_level || !academic_year) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Name, grade level, and academic year are required",
      });
    }

    // Validate teacher exists if provided
    if (class_teacher_id) {
      const [teacher] = await connection.query(
        'SELECT id FROM teachers WHERE id = ? AND status = "active"',
        [class_teacher_id]
      );

      if (teacher.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive teacher ID",
        });
      }
    }

    // Insert class
    const [result] = await connection.query(
      `INSERT INTO classes 
       (name, grade_level, academic_year, class_teacher_id, room_number, capacity, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        grade_level,
        academic_year,
        class_teacher_id || null,
        room_number || null,
        capacity || 40,
        status || "active",
        description || null,
      ]
    );

    const classId = result.insertId;

    // Create sections if provided
    if (sections && Array.isArray(sections) && sections.length > 0) {
      for (const sectionName of sections) {
        await connection.query(
          `INSERT INTO sections (name, class_id, capacity) 
           VALUES (?, ?, ?)`,
          [sectionName, classId, capacity || 40]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: { id: classId, name, grade_level },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create class",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if class exists
    const [existing] = await pool.query("SELECT id FROM classes WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Validate teacher if being updated
    if (updateData.class_teacher_id) {
      const [teacher] = await pool.query(
        'SELECT id FROM teachers WHERE id = ? AND status = "active"',
        [updateData.class_teacher_id]
      );

      if (teacher.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive teacher ID",
        });
      }
    }

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    values.push(id);

    await pool.query(
      `UPDATE classes SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Class updated successfully",
    });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update class",
      error: error.message,
    });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if class has students
    const [students] = await pool.query(
      "SELECT COUNT(*) as count FROM students WHERE class_id = ?",
      [id]
    );

    if (students[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete class with enrolled students. Please transfer students first.",
      });
    }

    await pool.query("DELETE FROM classes WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Delete class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete class",
      error: error.message,
    });
  }
};

// Get class students
const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.query(
      `
      SELECT s.*, 
        u.email,
        sec.name as section_name,
        c.name as class_name,
        c.grade_level
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.class_id = ?
      ORDER BY sec.name, s.roll_number, s.first_name
    `,
      [id]
    );

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Get class students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// Assign class teacher (legacy - now managed at section level)
const assignClassTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id } = req.body;

    if (!teacher_id) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    // Validate teacher exists and is active
    const [teacher] = await pool.query(
      'SELECT id FROM teachers WHERE id = ? AND status = "active"',
      [teacher_id]
    );

    if (teacher.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive teacher ID",
      });
    }

    await pool.query(
      "UPDATE classes SET class_teacher_id = ?, updated_at = NOW() WHERE id = ?",
      [teacher_id, id]
    );

    res.json({
      success: true,
      message: "Class teacher assigned successfully",
    });
  } catch (error) {
    console.error("Assign class teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign class teacher",
      error: error.message,
    });
  }
};

// Remove class teacher
const removeClassTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE classes SET class_teacher_id = NULL, updated_at = NOW() WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Class teacher removed successfully",
    });
  } catch (error) {
    console.error("Remove class teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove class teacher",
      error: error.message,
    });
  }
};

// ============= SECTION FUNCTIONS =============

// Get sections for a class
const getClassSections = async (req, res) => {
  try {
    const { id } = req.params;

    const [sections] = await pool.query(
      `
      SELECT 
        sec.*,
        CONCAT(t.first_name, ' ', t.last_name) as class_teacher_name,
        t.employee_id as teacher_employee_id,
        t.phone as teacher_phone,
        u.email as teacher_email,
        COUNT(DISTINCT s.id) as student_count
      FROM sections sec
      LEFT JOIN teachers t ON sec.class_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON sec.id = s.section_id
      WHERE sec.class_id = ? AND sec.is_active = 1
      GROUP BY sec.id
      ORDER BY sec.name
    `,
      [id]
    );

    // Get subject teachers for each section
    for (let section of sections) {
      const [subjectTeachers] = await pool.query(
        `
        SELECT 
          sst.*,
          CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
          t.employee_id,
          u.email as teacher_email,
          subj.name as subject_name,
          subj.code as subject_code
        FROM section_subject_teachers sst
        JOIN teachers t ON sst.teacher_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        JOIN subjects subj ON sst.subject_id = subj.id
        WHERE sst.section_id = ? AND sst.is_active = 1
        ORDER BY subj.name
      `,
        [section.id]
      );
      section.subject_teachers = subjectTeachers;
    }

    res.json({
      success: true,
      count: sections.length,
      data: sections,
    });
  } catch (error) {
    console.error("Get class sections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sections",
      error: error.message,
    });
  }
};

// Get section by ID with details
const getSectionById = async (req, res) => {
  try {
    const { section_id } = req.params;

    const [sections] = await pool.query(
      `
      SELECT 
        sec.*,
        c.name as class_name,
        c.grade_level,
        c.academic_year,
        CONCAT(t.first_name, ' ', t.last_name) as class_teacher_name,
        t.employee_id as teacher_employee_id,
        t.phone as teacher_phone,
        u.email as teacher_email,
        COUNT(DISTINCT s.id) as student_count
      FROM sections sec
      JOIN classes c ON sec.class_id = c.id
      LEFT JOIN teachers t ON sec.class_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON sec.id = s.section_id
      WHERE sec.id = ?
      GROUP BY sec.id
    `,
      [section_id]
    );

    if (sections.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Get subject teachers
    const [subjectTeachers] = await pool.query(
      `
      SELECT 
        sst.*,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        t.employee_id,
        u.email as teacher_email,
        subj.name as subject_name,
        subj.code as subject_code
      FROM section_subject_teachers sst
      JOIN teachers t ON sst.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      JOIN subjects subj ON sst.subject_id = subj.id
      WHERE sst.section_id = ? AND sst.is_active = 1
      ORDER BY subj.name
    `,
      [section_id]
    );

    res.json({
      success: true,
      data: {
        ...sections[0],
        subject_teachers: subjectTeachers,
      },
    });
  } catch (error) {
    console.error("Get section error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch section",
      error: error.message,
    });
  }
};

// Create section for a class
const createSection = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { name, class_teacher_id, capacity } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Section name is required",
      });
    }

    // Check if class exists
    const [classExists] = await pool.query(
      "SELECT id FROM classes WHERE id = ?",
      [class_id]
    );

    if (classExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if section name already exists for this class
    const [existing] = await pool.query(
      "SELECT id FROM sections WHERE class_id = ? AND name = ?",
      [class_id, name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Section with this name already exists for this class",
      });
    }

    // Validate teacher if provided
    if (class_teacher_id) {
      const [teacher] = await pool.query(
        'SELECT id FROM teachers WHERE id = ? AND status = "active"',
        [class_teacher_id]
      );

      if (teacher.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive teacher ID",
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO sections (name, class_id, class_teacher_id, capacity) 
       VALUES (?, ?, ?, ?)`,
      [name, class_id, class_teacher_id || null, capacity || 40]
    );

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: {
        id: result.insertId,
        name,
        class_id,
        class_teacher_id,
      },
    });
  } catch (error) {
    console.error("Create section error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create section",
      error: error.message,
    });
  }
};

// Update section
const updateSection = async (req, res) => {
  try {
    const { section_id } = req.params;
    const updateData = req.body;

    // Check if section exists
    const [existing] = await pool.query(
      "SELECT id FROM sections WHERE id = ?",
      [section_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Validate teacher if being updated
    if (updateData.class_teacher_id) {
      const [teacher] = await pool.query(
        'SELECT id FROM teachers WHERE id = ? AND status = "active"',
        [updateData.class_teacher_id]
      );

      if (teacher.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive teacher ID",
        });
      }
    }

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    values.push(section_id);

    await pool.query(
      `UPDATE sections SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error("Update section error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update section",
      error: error.message,
    });
  }
};

// Delete section
const deleteSection = async (req, res) => {
  try {
    const { section_id } = req.params;

    // Check if section has students
    const [students] = await pool.query(
      "SELECT COUNT(*) as count FROM students WHERE section_id = ?",
      [section_id]
    );

    if (students[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete section with enrolled students. Please transfer students first.",
      });
    }

    await pool.query("DELETE FROM sections WHERE id = ?", [section_id]);

    res.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error("Delete section error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete section",
      error: error.message,
    });
  }
};

// Assign section class teacher (homeroom teacher)
const assignSectionTeacher = async (req, res) => {
  try {
    const { section_id } = req.params;
    const { teacher_id } = req.body;

    if (!teacher_id) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    // Validate teacher exists and is active
    const [teacher] = await pool.query(
      'SELECT id FROM teachers WHERE id = ? AND status = "active"',
      [teacher_id]
    );

    if (teacher.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive teacher ID",
      });
    }

    // Check if section exists
    const [sectionExists] = await pool.query(
      "SELECT id FROM sections WHERE id = ?",
      [section_id]
    );

    if (sectionExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    await pool.query(
      "UPDATE sections SET class_teacher_id = ?, updated_at = NOW() WHERE id = ?",
      [teacher_id, section_id]
    );

    res.json({
      success: true,
      message: "Section class teacher assigned successfully",
    });
  } catch (error) {
    console.error("Assign section teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign section teacher",
      error: error.message,
    });
  }
};

// Remove section class teacher
const removeSectionTeacher = async (req, res) => {
  try {
    const { section_id } = req.params;

    await pool.query(
      "UPDATE sections SET class_teacher_id = NULL, updated_at = NOW() WHERE id = ?",
      [section_id]
    );

    res.json({
      success: true,
      message: "Section class teacher removed successfully",
    });
  } catch (error) {
    console.error("Remove section teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove section teacher",
      error: error.message,
    });
  }
};

// Get section students
const getSectionStudents = async (req, res) => {
  try {
    const { section_id } = req.params;

    const [students] = await pool.query(
      `
      SELECT s.*, u.email, c.name as class_name, c.grade_level
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.section_id = ?
      ORDER BY s.roll_number, s.first_name
    `,
      [section_id]
    );

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Get section students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch section students",
      error: error.message,
    });
  }
};

// ============= SECTION SUBJECT TEACHER FUNCTIONS =============

// Get subject teachers for a section
const getSectionSubjectTeachers = async (req, res) => {
  try {
    const { section_id } = req.params;

    const [teachers] = await pool.query(
      `
      SELECT 
        sst.*,
        CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
        t.employee_id,
        t.phone as teacher_phone,
        u.email as teacher_email,
        subj.name as subject_name,
        subj.code as subject_code,
        subj.description as subject_description
      FROM section_subject_teachers sst
      JOIN teachers t ON sst.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      JOIN subjects subj ON sst.subject_id = subj.id
      WHERE sst.section_id = ? AND sst.is_active = 1
      ORDER BY subj.name
    `,
      [section_id]
    );

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Get section subject teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch section subject teachers",
      error: error.message,
    });
  }
};

// Assign subject teacher to section
const assignSectionSubjectTeacher = async (req, res) => {
  try {
    const { section_id } = req.params;
    const { teacher_id, subject_id, academic_year } = req.body;

    if (!teacher_id || !subject_id) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID and Subject ID are required",
      });
    }

    // Validate section exists
    const [section] = await pool.query("SELECT id FROM sections WHERE id = ?", [
      section_id,
    ]);

    if (section.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Validate teacher exists and is active
    const [teacher] = await pool.query(
      'SELECT id FROM teachers WHERE id = ? AND status = "active"',
      [teacher_id]
    );

    if (teacher.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive teacher ID",
      });
    }

    // Validate subject exists
    const [subject] = await pool.query("SELECT id FROM subjects WHERE id = ?", [
      subject_id,
    ]);

    if (subject.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // Check if this subject already has a teacher in this section for this academic year
    const [existing] = await pool.query(
      `SELECT id FROM section_subject_teachers 
       WHERE section_id = ? AND subject_id = ? AND academic_year = ? AND is_active = 1`,
      [section_id, subject_id, academic_year || null]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This subject already has a teacher assigned in this section for the specified academic year",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO section_subject_teachers 
       (section_id, teacher_id, subject_id, academic_year, is_active) 
       VALUES (?, ?, ?, ?, 1)`,
      [section_id, teacher_id, subject_id, academic_year || null]
    );

    res.status(201).json({
      success: true,
      message: "Subject teacher assigned to section successfully",
      data: {
        id: result.insertId,
        section_id,
        teacher_id,
        subject_id,
      },
    });
  } catch (error) {
    console.error("Assign section subject teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign subject teacher to section",
      error: error.message,
    });
  }
};

// Update section subject teacher
const updateSectionSubjectTeacher = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { teacher_id, subject_id, academic_year, is_active } = req.body;

    // Check if assignment exists
    const [existing] = await pool.query(
      "SELECT id FROM section_subject_teachers WHERE id = ?",
      [assignment_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Validate teacher if being updated
    if (teacher_id) {
      const [teacher] = await pool.query(
        'SELECT id FROM teachers WHERE id = ? AND status = "active"',
        [teacher_id]
      );

      if (teacher.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive teacher ID",
        });
      }
    }

    // Validate subject if being updated
    if (subject_id) {
      const [subject] = await pool.query(
        "SELECT id FROM subjects WHERE id = ?",
        [subject_id]
      );

      if (subject.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid subject ID",
        });
      }
    }

    const updateData = {};
    if (teacher_id !== undefined) updateData.teacher_id = teacher_id;
    if (subject_id !== undefined) updateData.subject_id = subject_id;
    if (academic_year !== undefined) updateData.academic_year = academic_year;
    if (is_active !== undefined) updateData.is_active = is_active;

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    values.push(assignment_id);

    await pool.query(
      `UPDATE section_subject_teachers SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Section subject teacher updated successfully",
    });
  } catch (error) {
    console.error("Update section subject teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update section subject teacher",
      error: error.message,
    });
  }
};

// Remove subject teacher from section
const removeSectionSubjectTeacher = async (req, res) => {
  try {
    const { assignment_id } = req.params;

    const [existing] = await pool.query(
      "SELECT id FROM section_subject_teachers WHERE id = ?",
      [assignment_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    await pool.query("DELETE FROM section_subject_teachers WHERE id = ?", [
      assignment_id,
    ]);

    res.json({
      success: true,
      message: "Subject teacher removed from section successfully",
    });
  } catch (error) {
    console.error("Remove section subject teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove subject teacher from section",
      error: error.message,
    });
  }
};

module.exports = {
  // Class functions
  getAllClasses,
  getMyClasses,
  getMySections,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  assignClassTeacher,
  removeClassTeacher,

  // Section functions
  getClassSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  assignSectionTeacher,
  removeSectionTeacher,
  getSectionStudents,

  // Section subject teacher functions
  getSectionSubjectTeachers,
  assignSectionSubjectTeacher,
  updateSectionSubjectTeacher,
  removeSectionSubjectTeacher,
};
