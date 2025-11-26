const pool = require("../config/database");

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const { status, priority, target_audience, class_id, section_id } = req.query;

    let query = `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        c.name as class_name,
        c.grade_level,
        sec.name as section_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      WHERE 1=1
    `;

    const params = [];

    if (status === 'active') {
      query += " AND a.is_active = 1 AND (a.expires_at IS NULL OR a.expires_at > NOW())";
    } else if (status === 'expired') {
      query += " AND a.expires_at IS NOT NULL AND a.expires_at <= NOW()";
    } else if (status === 'inactive') {
      query += " AND a.is_active = 0";
    }

    if (priority) {
      query += " AND a.priority = ?";
      params.push(priority);
    }

    if (target_audience) {
      query += " AND a.target_audience = ?";
      params.push(target_audience);
    }

    if (class_id) {
      query += " AND a.class_id = ?";
      params.push(class_id);
    }

    if (section_id) {
      query += " AND a.section_id = ?";
      params.push(section_id);
    }

    query += " ORDER BY a.priority DESC, a.published_at DESC, a.created_at DESC";

    const [announcements] = await pool.query(query, params);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

// Get announcements for logged-in user (role-based)
const getMyAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = "";
    let params = [];

    // Admin roles see all active announcements
    const adminRoles = ["super_admin", "principal", "vice_principal", "hod"];
    
    if (adminRoles.includes(userRole)) {
      query = `
        SELECT 
          a.*,
          CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
          c.name as class_name,
          c.grade_level,
          sec.name as section_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN sections sec ON a.section_id = sec.id
        WHERE a.is_active = 1 
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
        ORDER BY a.priority DESC, a.published_at DESC
      `;
    } else if (userRole === "teacher") {
      // Teachers see announcements targeted to teachers or their classes/sections
      query = `
        SELECT DISTINCT
          a.*,
          CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
          c.name as class_name,
          c.grade_level,
          sec.name as section_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN sections sec ON a.section_id = sec.id
        LEFT JOIN teachers t ON t.user_id = ?
        LEFT JOIN sections teacher_sec ON teacher_sec.class_teacher_id = t.id
        WHERE a.is_active = 1 
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
          AND (
            a.target_audience = 'all'
            OR a.target_audience = 'teachers'
            OR (a.class_id IS NOT NULL AND a.class_id = teacher_sec.class_id)
            OR (a.section_id IS NOT NULL AND a.section_id = teacher_sec.id)
          )
        ORDER BY a.priority DESC, a.published_at DESC
      `;
      params = [userId];
    } else if (userRole === "student") {
      // Students see announcements targeted to students or their class/section
      query = `
        SELECT DISTINCT
          a.*,
          CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
          c.name as class_name,
          c.grade_level,
          sec.name as section_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN sections sec ON a.section_id = sec.id
        JOIN students s ON s.user_id = ?
        WHERE a.is_active = 1 
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
          AND (
            a.target_audience = 'all'
            OR a.target_audience = 'students'
            OR (a.class_id IS NOT NULL AND a.class_id = s.class_id)
            OR (a.section_id IS NOT NULL AND a.section_id = s.section_id)
          )
        ORDER BY a.priority DESC, a.published_at DESC
      `;
      params = [userId];
    } else if (userRole === "parent") {
      // Parents see announcements targeted to parents or their children's class/section
      query = `
        SELECT DISTINCT
          a.*,
          CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
          c.name as class_name,
          c.grade_level,
          sec.name as section_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN sections sec ON a.section_id = sec.id
        JOIN parent_student ps ON ps.parent_id = (SELECT id FROM parents WHERE user_id = ?)
        JOIN students s ON s.id = ps.student_id
        WHERE a.is_active = 1 
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
          AND (
            a.target_audience = 'all'
            OR a.target_audience = 'parents'
            OR (a.class_id IS NOT NULL AND a.class_id = s.class_id)
            OR (a.section_id IS NOT NULL AND a.section_id = s.section_id)
          )
        ORDER BY a.priority DESC, a.published_at DESC
      `;
      params = [userId];
    } else {
      // Default: only general announcements
      query = `
        SELECT 
          a.*,
          CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
          c.name as class_name,
          c.grade_level,
          sec.name as section_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN sections sec ON a.section_id = sec.id
        WHERE a.is_active = 1 
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
          AND a.target_audience = 'all'
        ORDER BY a.priority DESC, a.published_at DESC
      `;
    }

    const [announcements] = await pool.query(query, params);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get my announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const [announcements] = await pool.query(
      `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        u.email as created_by_email,
        c.name as class_name,
        c.grade_level,
        sec.name as section_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      WHERE a.id = ?
    `,
      [id]
    );

    if (announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      data: announcements[0],
    });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcement",
      error: error.message,
    });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      priority,
      target_audience,
      class_id,
      section_id,
      expires_at,
      is_active,
      published_at,
    } = req.body;

    const created_by = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Validate class_id if provided
    if (class_id) {
      const [classExists] = await pool.query(
        "SELECT id FROM classes WHERE id = ?",
        [class_id]
      );

      if (classExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid class ID",
        });
      }
    }

    // Validate section_id if provided
    if (section_id) {
      const [sectionExists] = await pool.query(
        "SELECT id FROM sections WHERE id = ?",
        [section_id]
      );

      if (sectionExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid section ID",
        });
      }
    }

    // Validate priority
    const validPriorities = ["low", "normal", "urgent"];
    const announcementPriority = priority || "normal";
    if (!validPriorities.includes(announcementPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Must be low, normal, or urgent",
      });
    }

    // Validate target_audience
    const validAudiences = ["all", "students", "teachers", "parents", "staff"];
    const audience = target_audience || "all";
    if (!validAudiences.includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO announcements 
       (title, content, priority, target_audience, class_id, section_id, expires_at, is_active, created_by, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        announcementPriority,
        audience,
        class_id || null,
        section_id || null,
        expires_at || null,
        is_active !== undefined ? is_active : 1,
        created_by,
        published_at || new Date(),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: {
        id: result.insertId,
        title,
        content,
        priority: announcementPriority,
        target_audience: audience,
        class_id,
        section_id,
        created_by,
      },
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
      error: error.message,
    });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if announcement exists
    const [existing] = await pool.query(
      "SELECT id, created_by FROM announcements WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Validate class_id if being updated
    if (updateData.class_id) {
      const [classExists] = await pool.query(
        "SELECT id FROM classes WHERE id = ?",
        [updateData.class_id]
      );

      if (classExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid class ID",
        });
      }
    }

    // Validate section_id if being updated
    if (updateData.section_id) {
      const [sectionExists] = await pool.query(
        "SELECT id FROM sections WHERE id = ?",
        [updateData.section_id]
      );

      if (sectionExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid section ID",
        });
      }
    }

    // Validate priority if being updated
    if (updateData.priority) {
      const validPriorities = ["low", "normal", "urgent"];
      if (!validPriorities.includes(updateData.priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority. Must be low, normal, or urgent",
        });
      }
    }

    // Validate target_audience if being updated
    if (updateData.target_audience) {
      const validAudiences = ["all", "students", "teachers", "parents", "staff"];
      if (!validAudiences.includes(updateData.target_audience)) {
        return res.status(400).json({
          success: false,
          message: "Invalid target audience",
        });
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_by;
    delete updateData.created_at;

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
      `UPDATE announcements SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Announcement updated successfully",
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
      error: error.message,
    });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const [existing] = await pool.query(
      "SELECT id FROM announcements WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await pool.query("DELETE FROM announcements WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
      error: error.message,
    });
  }
};

// Toggle announcement status (activate/deactivate)
const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if announcement exists and get current status
    const [existing] = await pool.query(
      "SELECT id, is_active FROM announcements WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const newStatus = existing[0].is_active ? 0 : 1;

    await pool.query(
      "UPDATE announcements SET is_active = ?, updated_at = NOW() WHERE id = ?",
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `Announcement ${newStatus ? "activated" : "deactivated"} successfully`,
      data: {
        id,
        is_active: newStatus,
      },
    });
  } catch (error) {
    console.error("Toggle announcement status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle announcement status",
      error: error.message,
    });
  }
};

// Publish announcement (set published_at to now)
const publishAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const [existing] = await pool.query(
      "SELECT id, published_at FROM announcements WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await pool.query(
      "UPDATE announcements SET published_at = NOW(), is_active = 1, updated_at = NOW() WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Announcement published successfully",
    });
  } catch (error) {
    console.error("Publish announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish announcement",
      error: error.message,
    });
  }
};

// Get announcements by class
const getAnnouncementsByClass = async (req, res) => {
  try {
    const { class_id } = req.params;

    const [announcements] = await pool.query(
      `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        c.name as class_name,
        c.grade_level,
        sec.name as section_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      WHERE a.class_id = ? 
        AND a.is_active = 1 
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
      ORDER BY a.priority DESC, a.published_at DESC
    `,
      [class_id]
    );

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements by class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

// Get announcements by section
const getAnnouncementsBySection = async (req, res) => {
  try {
    const { section_id } = req.params;

    const [announcements] = await pool.query(
      `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        c.name as class_name,
        c.grade_level,
        sec.name as section_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      WHERE a.section_id = ? 
        AND a.is_active = 1 
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
      ORDER BY a.priority DESC, a.published_at DESC
    `,
      [section_id]
    );

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements by section error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

// Get urgent announcements
const getUrgentAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.query(
      `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        c.name as class_name,
        c.grade_level,
        sec.name as section_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      WHERE a.priority = 'urgent' 
        AND a.is_active = 1 
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
      ORDER BY a.published_at DESC
    `
    );

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get urgent announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch urgent announcements",
      error: error.message,
    });
  }
};

// Get announcements created by logged-in user
const getMyCreatedAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id;

    const [announcements] = await pool.query(
      `
      SELECT 
        a.*,
        c.name as class_name,
        c.grade_level,
        sec.name as section_name
      FROM announcements a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      WHERE a.created_by = ?
      ORDER BY a.created_at DESC
    `,
      [userId]
    );

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get my created announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  publishAnnouncement,
  getAnnouncementsByClass,
  getAnnouncementsBySection,
  getUrgentAnnouncements,
  getMyCreatedAnnouncements,
};