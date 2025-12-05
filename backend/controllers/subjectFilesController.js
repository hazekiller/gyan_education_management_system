const pool = require("../config/database");
const path = require("path");
const fs = require("fs").promises;

/**
 * Subject Files Controller
 * Handles CRUD operations for subject files and folders
 */

// Get files/folders for a subject
const getFiles = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, parent_folder_id } = req.query;
    const userRole = req.user.role;

    if (!subject_id || !class_id) {
      return res.status(400).json({
        success: false,
        message: "subject_id and class_id are required",
      });
    }

    let query = `
      SELECT 
        sf.*,
        u.email as uploaded_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(s.first_name, ' ', s.last_name),
          u.email
        ) as uploaded_by_name
      FROM subject_files sf
      LEFT JOIN users u ON sf.uploaded_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE sf.subject_id = ? AND sf.class_id = ?
    `;

    const params = [subject_id, class_id];

    // Section filter
    if (section_id) {
      query += " AND (sf.section_id = ? OR sf.section_id IS NULL)";
      params.push(section_id);
    } else {
      query += " AND sf.section_id IS NULL";
    }

    // Parent folder filter
    if (parent_folder_id) {
      query += " AND sf.parent_folder_id = ?";
      params.push(parent_folder_id);
    } else {
      query += " AND sf.parent_folder_id IS NULL";
    }

    query += " ORDER BY sf.is_folder DESC, sf.file_name ASC";

    const [files] = await pool.query(query, params);

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
      error: error.message,
    });
  }
};

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { subject_id, class_id, section_id, parent_folder_id, description } =
      req.body;
    const uploaded_by = req.user.id;

    if (!subject_id || !class_id) {
      return res.status(400).json({
        success: false,
        message: "subject_id and class_id are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO subject_files 
       (subject_id, class_id, section_id, file_name, file_path, file_type, file_size, parent_folder_id, is_folder, uploaded_by, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?)`,
      [
        subject_id,
        class_id,
        section_id || null,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        parent_folder_id || null,
        uploaded_by,
        description || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: result.insertId,
        file_name: req.file.originalname,
        file_path: req.file.path,
      },
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
};

// Create folder
const createFolder = async (req, res) => {
  try {
    const {
      subject_id,
      class_id,
      section_id,
      folder_name,
      parent_folder_id,
      description,
    } = req.body;
    const uploaded_by = req.user.id;

    if (!subject_id || !class_id || !folder_name) {
      return res.status(400).json({
        success: false,
        message: "subject_id, class_id, and folder_name are required",
      });
    }

    // Generate folder path
    const folderPath = `subjects/${subject_id}/class_${class_id}/${folder_name}/`;

    const [result] = await pool.query(
      `INSERT INTO subject_files 
       (subject_id, class_id, section_id, file_name, file_path, parent_folder_id, is_folder, uploaded_by, description)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
      [
        subject_id,
        class_id,
        section_id || null,
        folder_name,
        folderPath,
        parent_folder_id || null,
        uploaded_by,
        description || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: {
        id: result.insertId,
        folder_name,
        folder_path: folderPath,
      },
    });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create folder",
      error: error.message,
    });
  }
};

// Update file/folder
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_name, description } = req.body;

    if (!file_name) {
      return res.status(400).json({
        success: false,
        message: "file_name is required",
      });
    }

    await pool.query(
      "UPDATE subject_files SET file_name = ?, description = ?, updated_at = NOW() WHERE id = ?",
      [file_name, description || null, id]
    );

    res.json({
      success: true,
      message: "Item updated successfully",
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item",
      error: error.message,
    });
  }
};

// Delete file/folder
const deleteItem = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get item details
    const [items] = await connection.query(
      "SELECT file_path, is_folder FROM subject_files WHERE id = ?",
      [id]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const item = items[0];

    // If it's a file, delete physical file
    if (!item.is_folder) {
      try {
        await fs.unlink(item.file_path);
      } catch (fileError) {
        console.error("File deletion error:", fileError);
        // Continue anyway - database cleanup is more important
      }
    }

    // Delete from database (CASCADE will handle children)
    await connection.query("DELETE FROM subject_files WHERE id = ?", [id]);

    await connection.commit();

    res.json({
      success: true,
      message: item.is_folder
        ? "Folder deleted successfully"
        : "File deleted successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Delete item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const [files] = await pool.query(
      "SELECT file_path, file_name, file_type FROM subject_files WHERE id = ? AND is_folder = FALSE",
      [id]
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const file = files[0];

    res.download(file.file_path, file.file_name);
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download file",
      error: error.message,
    });
  }
};

module.exports = {
  getFiles,
  uploadFile,
  createFolder,
  updateItem,
  deleteItem,
  downloadFile,
};
