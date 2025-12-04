const pool = require("../config/database");

/**
 * Get all subjects assigned to a specific class
 */
const getClassSubjects = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { academic_year, is_active } = req.query;

    let query = `
      SELECT 
        cs.id as assignment_id,
        cs.class_id,
        cs.subject_id,
        cs.teacher_id,
        cs.academic_year,
        cs.is_active,
        cs.created_at,
        s.name as subject_name,
        s.code as subject_code,
        s.description as subject_description,
        c.name as class_name,
        c.grade_level,
        t.id as teacher_id,
        t.first_name as teacher_first_name,
        t.last_name as teacher_last_name,
        u.email as teacher_email
      FROM class_subjects cs
      INNER JOIN subjects s ON cs.subject_id = s.id
      INNER JOIN classes c ON cs.class_id = c.id
      LEFT JOIN teachers t ON cs.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE cs.class_id = ?
    `;

    const params = [class_id];

    if (academic_year) {
      query += " AND cs.academic_year = ?";
      params.push(academic_year);
    }

    if (is_active !== undefined) {
      query += " AND cs.is_active = ?";
      params.push(is_active === "true" ? 1 : 0);
    }

    query += " ORDER BY s.name";

    const [classSubjects] = await pool.query(query, params);

    res.json({
      success: true,
      count: classSubjects.length,
      data: classSubjects,
    });
  } catch (error) {
    console.error("Get class subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch class subjects",
      error: error.message,
    });
  }
};

/**
 * Get subjects for a specific section
 */
const getSectionSubjects = async (req, res) => {
  try {
    const { section_id } = req.params;
    const { academic_year } = req.query;

    // First get the class_id from section
    const [section] = await pool.query(
      "SELECT class_id FROM sections WHERE id = ?",
      [section_id]
    );

    if (section.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const class_id = section[0].class_id;

    // Get class subjects
    let query = `
      SELECT 
        cs.id as class_subject_id,
        cs.subject_id,
        cs.class_id,
        cs.teacher_id as default_teacher_id,
        cs.academic_year,
        s.name as subject_name,
        s.code as subject_code,
        s.description as subject_description,
        sst.id as section_assignment_id,
        sst.teacher_id as section_teacher_id,
        t1.first_name as default_teacher_first_name,
        t1.last_name as default_teacher_last_name,
        u1.email as default_teacher_email,
        t2.first_name as section_teacher_first_name,
        t2.last_name as section_teacher_last_name,
        u2.email as section_teacher_email
      FROM class_subjects cs
      INNER JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN section_subject_teachers sst ON sst.subject_id = cs.subject_id 
        AND sst.section_id = ?
      LEFT JOIN teachers t1 ON cs.teacher_id = t1.id
      LEFT JOIN users u1 ON t1.user_id = u1.id
      LEFT JOIN teachers t2 ON sst.teacher_id = t2.id
      LEFT JOIN users u2 ON t2.user_id = u2.id
      WHERE cs.class_id = ? AND cs.is_active = 1
    `;

    const params = [section_id, class_id];

    if (academic_year) {
      query += " AND cs.academic_year = ?";
      params.push(academic_year);
    }

    query += " ORDER BY s.name";

    const [sectionSubjects] = await pool.query(query, params);

    res.json({
      success: true,
      count: sectionSubjects.length,
      data: sectionSubjects,
    });
  } catch (error) {
    console.error("Get section subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch section subjects",
      error: error.message,
    });
  }
};

/**
 * Assign a subject to a class
 */
const assignSubjectToClass = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { class_id, subject_id, teacher_id, academic_year } = req.body;

    // Validation
    if (!class_id || !subject_id) {
      return res.status(400).json({
        success: false,
        message: "Class ID and Subject ID are required",
      });
    }

    // Check if class exists
    const [classExists] = await connection.query(
      "SELECT id FROM classes WHERE id = ?",
      [class_id]
    );

    if (classExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if subject exists
    const [subjectExists] = await connection.query(
      "SELECT id, name FROM subjects WHERE id = ?",
      [subject_id]
    );

    if (subjectExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check if teacher exists (if provided)
    if (teacher_id) {
      const [teacherExists] = await connection.query(
        "SELECT id FROM teachers WHERE id = ?",
        [teacher_id]
      );

      if (teacherExists.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }

    // Check for duplicate assignment
    const [duplicate] = await connection.query(
      `SELECT id FROM class_subjects 
       WHERE class_id = ? AND subject_id = ? AND academic_year = ?`,
      [class_id, subject_id, academic_year || new Date().getFullYear()]
    );

    if (duplicate.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message:
          "This subject is already assigned to this class for the specified academic year",
      });
    }

    // Insert the assignment
    const [result] = await connection.query(
      `INSERT INTO class_subjects 
       (class_id, subject_id, teacher_id, academic_year, is_active) 
       VALUES (?, ?, ?, ?, 1)`,
      [
        class_id,
        subject_id,
        teacher_id || null,
        academic_year || new Date().getFullYear(),
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Subject assigned to class successfully",
      data: {
        id: result.insertId,
        class_id,
        subject_id,
        subject_name: subjectExists[0].name,
        teacher_id,
        academic_year: academic_year || new Date().getFullYear(),
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Assign subject to class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign subject to class",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Assign multiple subjects to a class at once
 */
const assignMultipleSubjectsToClass = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { class_id, subjects, academic_year } = req.body;

    // Validation
    if (
      !class_id ||
      !subjects ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Class ID and subjects array are required",
      });
    }

    // Check if class exists
    const [classExists] = await connection.query(
      "SELECT id, name FROM classes WHERE id = ?",
      [class_id]
    );

    if (classExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const year = academic_year || new Date().getFullYear();
    const insertedSubjects = [];
    const errors = [];

    for (const subject of subjects) {
      try {
        const { subject_id, teacher_id } = subject;

        // Check if subject exists
        const [subjectExists] = await connection.query(
          "SELECT id, name FROM subjects WHERE id = ?",
          [subject_id]
        );

        if (subjectExists.length === 0) {
          errors.push({
            subject_id,
            error: "Subject not found",
          });
          continue;
        }

        // Check for duplicate
        const [duplicate] = await connection.query(
          `SELECT id FROM class_subjects 
           WHERE class_id = ? AND subject_id = ? AND academic_year = ?`,
          [class_id, subject_id, year]
        );

        if (duplicate.length > 0) {
          errors.push({
            subject_id,
            subject_name: subjectExists[0].name,
            error: "Already assigned",
          });
          continue;
        }

        // Insert the assignment
        const [result] = await connection.query(
          `INSERT INTO class_subjects 
           (class_id, subject_id, teacher_id, academic_year, is_active) 
           VALUES (?, ?, ?, ?, 1)`,
          [class_id, subject_id, teacher_id || null, year]
        );

        insertedSubjects.push({
          id: result.insertId,
          subject_id,
          subject_name: subjectExists[0].name,
          teacher_id,
        });
      } catch (error) {
        errors.push({
          subject_id: subject.subject_id,
          error: error.message,
        });
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `${insertedSubjects.length} subject(s) assigned successfully`,
      data: {
        class_id,
        class_name: classExists[0].name,
        academic_year: year,
        inserted: insertedSubjects,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Assign multiple subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign subjects to class",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Assign teacher to section-subject
 */
const assignTeacherToSectionSubject = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { section_id, subject_id, teacher_id, academic_year } = req.body;

    // Validation
    if (!section_id || !subject_id || !teacher_id) {
      return res.status(400).json({
        success: false,
        message: "Section ID, Subject ID, and Teacher ID are required",
      });
    }

    // Check if assignment already exists
    const [existing] = await connection.query(
      `SELECT id FROM section_subject_teachers 
       WHERE section_id = ? AND subject_id = ?`,
      [section_id, subject_id]
    );

    if (existing.length > 0) {
      // Update existing assignment
      await connection.query(
        `UPDATE section_subject_teachers 
         SET teacher_id = ?, updated_at = NOW() 
         WHERE id = ?`,
        [teacher_id, existing[0].id]
      );

      await connection.commit();

      return res.json({
        success: true,
        message: "Teacher assignment updated successfully",
        data: {
          id: existing[0].id,
          section_id,
          subject_id,
          teacher_id,
        },
      });
    }

    // Insert new assignment
    const [result] = await connection.query(
      `INSERT INTO section_subject_teachers 
       (section_id, subject_id, teacher_id, academic_year, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        section_id,
        subject_id,
        teacher_id,
        academic_year || new Date().getFullYear(),
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Teacher assigned to section subject successfully",
      data: {
        id: result.insertId,
        section_id,
        subject_id,
        teacher_id,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Assign teacher to section subject error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign teacher to section subject",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Update class subject assignment
 */
const updateClassSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id, is_active, academic_year } = req.body;

    // Check if assignment exists
    const [existing] = await pool.query(
      "SELECT id FROM class_subjects WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class subject assignment not found",
      });
    }

    const updates = [];
    const params = [];

    if (teacher_id !== undefined) {
      updates.push("teacher_id = ?");
      params.push(teacher_id);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (academic_year !== undefined) {
      updates.push("academic_year = ?");
      params.push(academic_year);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    params.push(id);

    await pool.query(
      `UPDATE class_subjects SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: "Class subject assignment updated successfully",
    });
  } catch (error) {
    console.error("Update class subject error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update class subject assignment",
      error: error.message,
    });
  }
};

/**
 * Remove subject from class
 */
const removeSubjectFromClass = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Check if assignment exists
    const [existing] = await connection.query(
      "SELECT class_id, subject_id FROM class_subjects WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Class subject assignment not found",
      });
    }

    // Check if subject is being used in timetable
    const [timetableUsage] = await connection.query(
      `SELECT COUNT(*) as count FROM timetable 
       WHERE class_id = ? AND subject_id = ?`,
      [existing[0].class_id, existing[0].subject_id]
    );

    if (timetableUsage[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Cannot remove subject. It is being used in timetable. Please remove from timetable first.",
      });
    }

    // Delete the assignment
    await connection.query("DELETE FROM class_subjects WHERE id = ?", [id]);

    // Also remove section-level assignments for this class-subject
    await connection.query(
      `DELETE sst FROM section_subject_teachers sst
       INNER JOIN sections s ON sst.section_id = s.id
       WHERE s.class_id = ? AND sst.subject_id = ?`,
      [existing[0].class_id, existing[0].subject_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Subject removed from class successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Remove subject from class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove subject from class",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Get available subjects for a class (subjects not yet assigned)
 */
const getAvailableSubjectsForClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { academic_year } = req.query;

    const year = academic_year || new Date().getFullYear();

    const [availableSubjects] = await pool.query(
      `SELECT s.* 
       FROM subjects s
       WHERE s.is_active = 1 
       AND s.id NOT IN (
         SELECT subject_id 
         FROM class_subjects 
         WHERE class_id = ? AND academic_year = ?
       )
       ORDER BY s.name`,
      [class_id, year]
    );

    res.json({
      success: true,
      count: availableSubjects.length,
      data: availableSubjects,
    });
  } catch (error) {
    console.error("Get available subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available subjects",
      error: error.message,
    });
  }
};

module.exports = {
  getClassSubjects,
  getSectionSubjects,
  assignSubjectToClass,
  assignMultipleSubjectsToClass,
  assignTeacherToSectionSubject,
  updateClassSubject,
  removeSubjectFromClass,
  getAvailableSubjectsForClass,
};
