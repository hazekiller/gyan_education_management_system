const db = require("../config/database");

const leavesController = {
    // Get all leave applications with filters (Admin only)
    getAll: async (req, res) => {
        try {
            const { status, user_type, search, start_date, end_date } = req.query;

            let query = `
        SELECT 
          la.*,
          u.email as user_email,
          CASE 
            WHEN la.user_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
            WHEN la.user_type = 'teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
            WHEN la.user_type = 'staff' THEN CONCAT(st.first_name, ' ', st.last_name)
          END as user_name,
          CASE 
            WHEN la.user_type = 'student' THEN s.admission_number
            WHEN la.user_type = 'teacher' THEN t.employee_id
            WHEN la.user_type = 'staff' THEN st.employee_id
          END as user_identifier,
          reviewer.email as reviewer_email,
          CONCAT(
            COALESCE(
              (SELECT CONCAT(first_name, ' ', last_name) FROM students WHERE user_id = la.reviewed_by),
              (SELECT CONCAT(first_name, ' ', last_name) FROM teachers WHERE user_id = la.reviewed_by),
              (SELECT CONCAT(first_name, ' ', last_name) FROM staff WHERE user_id = la.reviewed_by),
              ''
            )
          ) as reviewer_name
        FROM leave_applications la
        JOIN users u ON la.user_id = u.id
        LEFT JOIN students s ON la.user_id = s.user_id AND la.user_type = 'student'
        LEFT JOIN teachers t ON la.user_id = t.user_id AND la.user_type = 'teacher'
        LEFT JOIN staff st ON la.user_id = st.user_id AND la.user_type = 'staff'
        LEFT JOIN users reviewer ON la.reviewed_by = reviewer.id
        WHERE 1=1
      `;
            const params = [];

            if (status) {
                query += " AND la.status = ?";
                params.push(status);
            }

            if (user_type) {
                query += " AND la.user_type = ?";
                params.push(user_type);
            }

            if (search) {
                query += ` AND (
          CASE 
            WHEN la.user_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
            WHEN la.user_type = 'teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
            WHEN la.user_type = 'staff' THEN CONCAT(st.first_name, ' ', st.last_name)
          END LIKE ? OR la.reason LIKE ?
        )`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm);
            }

            if (start_date) {
                query += " AND la.start_date >= ?";
                params.push(start_date);
            }

            if (end_date) {
                query += " AND la.end_date <= ?";
                params.push(end_date);
            }

            query += " ORDER BY la.created_at DESC";

            const [leaves] = await db.query(query, params);
            res.json({ success: true, data: leaves });
        } catch (error) {
            console.error("Error fetching leave applications:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching leave applications"
            });
        }
    },

    // Get single leave application by ID
    getById: async (req, res) => {
        try {
            const [leave] = await db.query(
                `SELECT 
          la.*,
          u.email as user_email,
          CASE 
            WHEN la.user_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
            WHEN la.user_type = 'teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
            WHEN la.user_type = 'staff' THEN CONCAT(st.first_name, ' ', st.last_name)
          END as user_name,
          reviewer.email as reviewer_email
        FROM leave_applications la
        JOIN users u ON la.user_id = u.id
        LEFT JOIN students s ON la.user_id = s.user_id AND la.user_type = 'student'
        LEFT JOIN teachers t ON la.user_id = t.user_id AND la.user_type = 'teacher'
        LEFT JOIN staff st ON la.user_id = st.user_id AND la.user_type = 'staff'
        LEFT JOIN users reviewer ON la.reviewed_by = reviewer.id
        WHERE la.id = ?`,
                [req.params.id]
            );

            if (leave.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Leave application not found"
                });
            }

            res.json({ success: true, data: leave[0] });
        } catch (error) {
            console.error("Error fetching leave application:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching leave application"
            });
        }
    },

    // Get logged-in user's leave applications
    getMyLeaves: async (req, res) => {
        try {
            const userId = req.user.id;

            const [leaves] = await db.query(
                `SELECT 
          la.*,
          u.email as user_email,
          CASE 
            WHEN la.user_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
            WHEN la.user_type = 'teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
            WHEN la.user_type = 'staff' THEN CONCAT(st.first_name, ' ', st.last_name)
          END as user_name,
          CASE 
            WHEN la.user_type = 'student' THEN s.admission_number
            WHEN la.user_type = 'teacher' THEN t.employee_id
            WHEN la.user_type = 'staff' THEN st.employee_id
          END as user_identifier,
          reviewer.email as reviewer_email,
          CONCAT(
            COALESCE(
              (SELECT CONCAT(first_name, ' ', last_name) FROM students WHERE user_id = la.reviewed_by),
              (SELECT CONCAT(first_name, ' ', last_name) FROM teachers WHERE user_id = la.reviewed_by),
              (SELECT CONCAT(first_name, ' ', last_name) FROM staff WHERE user_id = la.reviewed_by),
              ''
            )
          ) as reviewer_name
        FROM leave_applications la
        JOIN users u ON la.user_id = u.id
        LEFT JOIN students s ON la.user_id = s.user_id AND la.user_type = 'student'
        LEFT JOIN teachers t ON la.user_id = t.user_id AND la.user_type = 'teacher'
        LEFT JOIN staff st ON la.user_id = st.user_id AND la.user_type = 'staff'
        LEFT JOIN users reviewer ON la.reviewed_by = reviewer.id
        WHERE la.user_id = ?
        ORDER BY la.created_at DESC`,
                [userId]
            );

            res.json({ success: true, data: leaves });
        } catch (error) {
            console.error("Error fetching my leaves:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching your leave applications"
            });
        }
    },

    // Get pending leave count (for admin dashboard)
    getPendingCount: async (req, res) => {
        try {
            const [result] = await db.query(
                "SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending'"
            );

            res.json({ success: true, count: result[0].count });
        } catch (error) {
            console.error("Error fetching pending count:", error);
            res.status(500).json({
                success: false,
                message: "Error fetching pending count"
            });
        }
    },

    // Create new leave application
    create: async (req, res) => {
        try {
            const {
                user_type,
                leave_type,
                start_date,
                end_date,
                reason,
            } = req.body;

            const userId = req.user.id;

            // Validate dates
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message: "End date must be after start date",
                });
            }

            // Calculate total days (inclusive)
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            // Get file path from multer upload (if file was uploaded)
            const supportingDocument = req.file ? req.file.path : null;

            const [result] = await db.query(
                `INSERT INTO leave_applications (
          user_id, user_type, leave_type, start_date, end_date, 
          total_days, reason, supporting_document, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [
                    userId,
                    user_type,
                    leave_type,
                    start_date,
                    end_date,
                    totalDays,
                    reason,
                    supportingDocument,
                ]
            );

            res.status(201).json({
                success: true,
                message: "Leave application submitted successfully",
                data: { id: result.insertId, total_days: totalDays },
            });
        } catch (error) {
            console.error("Error creating leave application:", error);
            res.status(500).json({
                success: false,
                message: "Error submitting leave application"
            });
        }
    },

    // Update leave application
    update: async (req, res) => {
        try {
            const {
                leave_type,
                start_date,
                end_date,
                reason,
                supporting_document,
                status,
                admin_remarks,
            } = req.body;

            const updateFields = [];
            const params = [];

            const addField = (field, value) => {
                if (value !== undefined) {
                    updateFields.push(`${field} = ?`);
                    params.push(value);
                }
            };

            addField("leave_type", leave_type);
            addField("start_date", start_date);
            addField("end_date", end_date);
            addField("reason", reason);
            addField("supporting_document", supporting_document);
            addField("status", status);
            addField("admin_remarks", admin_remarks);

            // Recalculate total days if dates changed
            if (start_date && end_date) {
                const startDate = new Date(start_date);
                const endDate = new Date(end_date);
                const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                addField("total_days", totalDays);
            }

            // If status is being changed, record reviewer
            if (status && status !== 'pending') {
                updateFields.push("reviewed_by = ?");
                params.push(req.user.id);
                updateFields.push("reviewed_at = NOW()");
            }

            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No fields to update"
                });
            }

            params.push(req.params.id);

            await db.query(
                `UPDATE leave_applications SET ${updateFields.join(", ")} WHERE id = ?`,
                params
            );

            res.json({ success: true, message: "Leave application updated successfully" });
        } catch (error) {
            console.error("Error updating leave application:", error);
            res.status(500).json({
                success: false,
                message: "Error updating leave application"
            });
        }
    },

    // Approve leave application
    approveLeave: async (req, res) => {
        try {
            const { admin_remarks } = req.body;

            await db.query(
                `UPDATE leave_applications 
         SET status = 'approved', 
             reviewed_by = ?, 
             reviewed_at = NOW(),
             admin_remarks = ?
         WHERE id = ?`,
                [req.user.id, admin_remarks || null, req.params.id]
            );

            res.json({
                success: true,
                message: "Leave application approved successfully"
            });
        } catch (error) {
            console.error("Error approving leave:", error);
            res.status(500).json({
                success: false,
                message: "Error approving leave application"
            });
        }
    },

    // Decline leave application
    declineLeave: async (req, res) => {
        try {
            const { admin_remarks } = req.body;

            if (!admin_remarks) {
                return res.status(400).json({
                    success: false,
                    message: "Admin remarks are required when declining a leave",
                });
            }

            await db.query(
                `UPDATE leave_applications 
         SET status = 'declined', 
             reviewed_by = ?, 
             reviewed_at = NOW(),
             admin_remarks = ?
         WHERE id = ?`,
                [req.user.id, admin_remarks, req.params.id]
            );

            res.json({
                success: true,
                message: "Leave application declined"
            });
        } catch (error) {
            console.error("Error declining leave:", error);
            res.status(500).json({
                success: false,
                message: "Error declining leave application"
            });
        }
    },

    // Delete leave application
    delete: async (req, res) => {
        try {
            // Optional: Check if user owns this leave or is admin
            const [leave] = await db.query(
                "SELECT user_id FROM leave_applications WHERE id = ?",
                [req.params.id]
            );

            if (leave.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Leave application not found",
                });
            }

            // Only allow deletion if user owns the leave and it's pending
            if (leave[0].user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to delete this leave",
                });
            }

            await db.query("DELETE FROM leave_applications WHERE id = ?", [req.params.id]);

            res.json({ success: true, message: "Leave application deleted successfully" });
        } catch (error) {
            console.error("Error deleting leave application:", error);
            res.status(500).json({
                success: false,
                message: "Error deleting leave application"
            });
        }
    },
};

module.exports = leavesController;
