const pool = require("../config/database");

// Get all discipline records with filtering
const getAllDisciplineRecords = async (req, res) => {
    try {
        const { student_id, category, severity, status, search } = req.query;

        let query = `
      SELECT 
        d.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.admission_number,
        c.name as class_name,
        COALESCE(
            CONCAT(t.first_name, ' ', t.last_name), 
            CONCAT(st.first_name, ' ', st.last_name), 
            u.email
        ) as reported_by_name
      FROM discipline_records d
      JOIN students s ON d.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON d.reported_by = u.id
      LEFT JOIN teachers t ON d.reported_by = t.user_id
      LEFT JOIN staff st ON d.reported_by = st.user_id
      WHERE 1=1
    `;

        const params = [];

        if (student_id) {
            query += " AND d.student_id = ?";
            params.push(student_id);
        }

        if (category) {
            query += " AND d.category = ?";
            params.push(category);
        }

        if (severity) {
            query += " AND d.severity = ?";
            params.push(severity);
        }

        if (status) {
            query += " AND d.status = ?";
            params.push(status);
        }

        if (search) {
            query += " AND (d.title LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)";
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += " ORDER BY d.created_at DESC";

        const [records] = await pool.query(query, params);

        res.json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error("Get discipline records error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch discipline records",
            error: error.message,
        });
    }
};

// Get single record by ID
const getDisciplineRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
      SELECT 
        d.*,
        s.first_name, s.last_name, s.admission_number,
        c.name as class_name,
        u.email as reported_by_email
      FROM discipline_records d
      JOIN students s ON d.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON d.reported_by = u.id
      WHERE d.id = ?
    `;

        const [records] = await pool.query(query, [id]);

        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Discipline record not found",
            });
        }

        res.json({
            success: true,
            data: records[0],
        });
    } catch (error) {
        console.error("Get discipline record error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch discipline record",
            error: error.message,
        });
    }
};

// Create record
const createDisciplineRecord = async (req, res) => {
    try {
        const {
            student_id,
            title,
            description,
            category,
            severity,
            rating,
            action_taken
        } = req.body;

        const reported_by = req.user.id; // From auth middleware

        if (!student_id || !title) {
            return res.status(400).json({
                success: false,
                message: "Student ID and Title are required",
            });
        }

        const query = `
      INSERT INTO discipline_records 
      (student_id, title, description, category, severity, rating, action_taken, reported_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

        const [result] = await pool.query(query, [
            student_id,
            title,
            description || null,
            category || 'behavior',
            severity || 'low',
            rating || null,
            action_taken || null,
            reported_by
        ]);

        res.status(201).json({
            success: true,
            message: "Discipline record created successfully",
            data: {
                id: result.insertId,
                ...req.body,
                reported_by
            },
        });
    } catch (error) {
        console.error("Create discipline record error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create discipline record",
            error: error.message,
        });
    }
};

// Update record
const updateDisciplineRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            category,
            severity,
            status,
            rating,
            action_taken
        } = req.body;

        const query = `
      UPDATE discipline_records 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        severity = COALESCE(?, severity),
        status = COALESCE(?, status),
        rating = COALESCE(?, rating),
        action_taken = COALESCE(?, action_taken)
      WHERE id = ?
    `;

        const [result] = await pool.query(query, [
            title,
            description,
            category,
            severity,
            status,
            rating,
            action_taken,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Discipline record not found",
            });
        }

        res.json({
            success: true,
            message: "Discipline record updated successfully",
        });
    } catch (error) {
        console.error("Update discipline record error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update discipline record",
            error: error.message,
        });
    }
};

// Delete record
const deleteDisciplineRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM discipline_records WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Discipline record not found",
            });
        }

        res.json({
            success: true,
            message: "Discipline record deleted successfully",
        });
    } catch (error) {
        console.error("Delete discipline record error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete discipline record",
            error: error.message,
        });
    }
};

module.exports = {
    getAllDisciplineRecords,
    getDisciplineRecordById,
    createDisciplineRecord,
    updateDisciplineRecord,
    deleteDisciplineRecord,
};
