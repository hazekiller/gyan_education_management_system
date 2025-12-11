const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const path = require("path");
const fs = require("fs");

// ---------------------
// GET ALL FRONT DESK STAFF
// ---------------------
const getAllFrontDeskStaff = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = `
            SELECT f.*, u.email, u.is_active, u.last_login 
            FROM frontdesk f 
            LEFT JOIN users u ON f.user_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += " AND f.status = ?";
            params.push(status);
        }
        if (search) {
            const searchTerm = `%${search}%`;
            query +=
                " AND (f.first_name LIKE ? OR f.last_name LIKE ? OR f.employee_id LIKE ?)";
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY f.first_name, f.last_name";
        const [frontdeskStaff] = await pool.query(query, params);

        res.json({
            success: true,
            count: frontdeskStaff.length,
            data: frontdeskStaff,
        });
    } catch (error) {
        console.error("Get frontdesk staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch frontdesk staff",
            error: error.message,
        });
    }
};

// ---------------------
// GET FRONT DESK STAFF BY ID
// ---------------------
const getFrontDeskStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const [frontdeskStaff] = await pool.query(
            `SELECT f.*, u.email, u.is_active, u.last_login, u.created_at as account_created
             FROM frontdesk f
             LEFT JOIN users u ON f.user_id = u.id
             WHERE f.id = ?`,
            [id]
        );

        if (frontdeskStaff.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Frontdesk staff not found" });
        }

        res.json({ success: true, data: frontdeskStaff[0] });
    } catch (error) {
        console.error("Get frontdesk staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch frontdesk staff",
            error: error.message,
        });
    }
};

// ---------------------
// CREATE FRONT DESK STAFF
// ---------------------
const createFrontDeskStaff = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            email,
            password,
            employee_id,
            first_name,
            middle_name,
            last_name,
            date_of_birth,
            gender,
            blood_group,
            address,
            city,
            state,
            pincode,
            phone,
            emergency_contact,
            shift_timing,
            joining_date,
            salary,
            status,
        } = req.body;

        if (
            !email ||
            !employee_id ||
            !first_name ||
            !last_name ||
            !date_of_birth ||
            !gender ||
            !phone
        ) {
            await connection.rollback();
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }

        // Check existing email
        const [existing] = await connection.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );
        if (existing.length > 0) {
            await connection.rollback();
            return res
                .status(409)
                .json({ success: false, message: "Email already exists" });
        }

        // Check existing employee_id
        const [existingEmp] = await connection.query(
            "SELECT id FROM frontdesk WHERE employee_id = ?",
            [employee_id]
        );
        if (existingEmp.length > 0) {
            await connection.rollback();
            return res
                .status(409)
                .json({ success: false, message: "Employee ID already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password || "FrontDesk@123", 10);

        // Create user with frontdesk role
        const [userResult] = await connection.query(
            "INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)",
            [email, hashedPassword, "frontdesk", true]
        );
        const userId = userResult.insertId;

        // Handle profile photo
        let profilePhotoPath = null;
        if (req.file) {
            profilePhotoPath = req.file.path.replace(/\\/g, "/"); // Windows fix
        }

        // Create frontdesk record
        const [frontdeskResult] = await connection.query(
            `INSERT INTO frontdesk (
                user_id, employee_id, first_name, middle_name, last_name,
                date_of_birth, gender, blood_group, address, city, state, pincode,
                phone, emergency_contact, shift_timing, joining_date, salary, 
                profile_photo, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                employee_id,
                first_name,
                middle_name || null,
                last_name,
                date_of_birth,
                gender,
                blood_group || null,
                address || null,
                city || null,
                state || null,
                pincode || null,
                phone,
                emergency_contact || null,
                shift_timing || null,
                joining_date || new Date(),
                salary || null,
                profilePhotoPath,
                status || "active",
            ]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            message: "Frontdesk staff created successfully",
            data: { id: frontdeskResult.insertId, user_id: userId, email },
        });
    } catch (error) {
        await connection.rollback();
        console.error("Create frontdesk staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create frontdesk staff",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

// ---------------------
// UPDATE FRONT DESK STAFF
// ---------------------
const updateFrontDeskStaff = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const updateData = { ...req.body };

        // Check if frontdesk staff exists
        const [existing] = await connection.query(
            "SELECT id, user_id FROM frontdesk WHERE id = ?",
            [id]
        );
        if (existing.length === 0) {
            await connection.rollback();
            return res
                .status(404)
                .json({ success: false, message: "Frontdesk staff not found" });
        }

        const frontdeskStaff = existing[0];

        // Handle User table updates (Email)
        if (updateData.email) {
            const [emailCheck] = await connection.query(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                [updateData.email, frontdeskStaff.user_id]
            );
            if (emailCheck.length > 0) {
                await connection.rollback();
                return res
                    .status(409)
                    .json({ success: false, message: "Email already exists" });
            }

            await connection.query("UPDATE users SET email = ? WHERE id = ?", [
                updateData.email,
                frontdeskStaff.user_id,
            ]);
            delete updateData.email;
        }

        // Handle Frontdesk table updates
        delete updateData.user_id;
        delete updateData.password;
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.updated_at;

        // Handle profile photo
        if (req.file) {
            updateData.profile_photo = req.file.path.replace(/\\/g, "/");
        }

        const fields = Object.keys(updateData);
        if (fields.length > 0) {
            const values = Object.values(updateData);
            const setClause = fields.map((f) => `${f} = ?`).join(", ");
            values.push(id);

            await connection.query(
                `UPDATE frontdesk SET ${setClause}, updated_at = NOW() WHERE id = ?`,
                values
            );
        }

        await connection.commit();
        res.json({ success: true, message: "Frontdesk staff updated successfully" });
    } catch (error) {
        await connection.rollback();
        console.error("Update frontdesk staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update frontdesk staff",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

// ---------------------
// DELETE FRONT DESK STAFF
// ---------------------
const deleteFrontDeskStaff = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;

        const [frontdeskStaff] = await connection.query(
            "SELECT user_id FROM frontdesk WHERE id = ?",
            [id]
        );
        if (!frontdeskStaff.length) {
            await connection.rollback();
            return res
                .status(404)
                .json({ success: false, message: "Frontdesk staff not found" });
        }

        const userId = frontdeskStaff[0].user_id;
        await connection.query("DELETE FROM frontdesk WHERE id = ?", [id]);
        if (userId)
            await connection.query("DELETE FROM users WHERE id = ?", [userId]);

        await connection.commit();
        res.json({ success: true, message: "Frontdesk staff deleted successfully" });
    } catch (error) {
        await connection.rollback();
        console.error("Delete frontdesk staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete frontdesk staff",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

// ---------------------
// LOG VISITOR
// ---------------------
const logVisitor = async (req, res) => {
    try {
        const {
            staff_id,
            visitor_name,
            visitor_phone,
            visitor_email,
            purpose,
            person_to_meet,
            remarks,
        } = req.body;

        if (!staff_id || !visitor_name || !purpose) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: staff_id, visitor_name, purpose",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO frontdesk_visitors (
                staff_id, visitor_name, visitor_phone, visitor_email,
                purpose, person_to_meet, check_in_time, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
                staff_id,
                visitor_name,
                visitor_phone || null,
                visitor_email || null,
                purpose,
                person_to_meet || null,
                remarks || null,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Visitor logged successfully",
            data: { id: result.insertId },
        });
    } catch (error) {
        console.error("Log visitor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to log visitor",
            error: error.message,
        });
    }
};

// ---------------------
// GET VISITOR LOGS
// ---------------------
const getVisitorLogs = async (req, res) => {
    try {
        const { staff_id, status, date_from, date_to } = req.query;
        let query = `
            SELECT v.*, 
                   CONCAT(s.first_name, ' ', s.last_name) as logged_by
            FROM frontdesk_visitors v
            LEFT JOIN staff s ON v.staff_id = s.id
            WHERE s.is_frontdesk = 1
        `;
        const params = [];

        if (staff_id) {
            query += " AND v.staff_id = ?";
            params.push(staff_id);
        }

        if (status === "active") {
            query += " AND v.check_out_time IS NULL";
        } else if (status === "completed") {
            query += " AND v.check_out_time IS NOT NULL";
        }

        if (date_from) {
            query += " AND DATE(v.check_in_time) >= ?";
            params.push(date_from);
        }

        if (date_to) {
            query += " AND DATE(v.check_in_time) <= ?";
            params.push(date_to);
        }

        query += " ORDER BY v.check_in_time DESC";

        const [visitors] = await pool.query(query, params);

        res.json({
            success: true,
            count: visitors.length,
            data: visitors,
        });
    } catch (error) {
        console.error("Get visitor logs error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch visitor logs",
            error: error.message,
        });
    }
};

// ---------------------
// CHECKOUT VISITOR
// ---------------------
const checkoutVisitor = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "UPDATE frontdesk_visitors SET check_out_time = NOW() WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Visitor not found",
            });
        }

        res.json({
            success: true,
            message: "Visitor checked out successfully",
        });
    } catch (error) {
        console.error("Checkout visitor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to checkout visitor",
            error: error.message,
        });
    }
};

// ---------------------
// CREATE INQUIRY
// ---------------------
const createInquiry = async (req, res) => {
    try {
        const {
            staff_id,
            inquiry_type,
            inquirer_name,
            inquirer_phone,
            inquirer_email,
            subject,
            details,
            priority,
            assigned_to,
        } = req.body;

        if (!staff_id || !inquirer_name || !subject) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: staff_id, inquirer_name, subject",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO frontdesk_inquiries (
                staff_id, inquiry_type, inquirer_name, inquirer_phone,
                inquirer_email, subject, details, priority, assigned_to
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                staff_id,
                inquiry_type || "general",
                inquirer_name,
                inquirer_phone || null,
                inquirer_email || null,
                subject,
                details || null,
                priority || "medium",
                assigned_to || null,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Inquiry created successfully",
            data: { id: result.insertId },
        });
    } catch (error) {
        console.error("Create inquiry error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create inquiry",
            error: error.message,
        });
    }
};

// ---------------------
// GET INQUIRIES
// ---------------------
const getInquiries = async (req, res) => {
    try {
        const { staff_id, status, priority, inquiry_type } = req.query;
        let query = `
            SELECT i.*, 
                   CONCAT(s.first_name, ' ', s.last_name) as logged_by
            FROM frontdesk_inquiries i
            LEFT JOIN staff s ON i.staff_id = s.id
            WHERE s.is_frontdesk = 1
        `;
        const params = [];

        if (staff_id) {
            query += " AND i.staff_id = ?";
            params.push(staff_id);
        }

        if (status) {
            query += " AND i.status = ?";
            params.push(status);
        }

        if (priority) {
            query += " AND i.priority = ?";
            params.push(priority);
        }

        if (inquiry_type) {
            query += " AND i.inquiry_type = ?";
            params.push(inquiry_type);
        }

        query += " ORDER BY i.created_at DESC";

        const [inquiries] = await pool.query(query, params);

        res.json({
            success: true,
            count: inquiries.length,
            data: inquiries,
        });
    } catch (error) {
        console.error("Get inquiries error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiries",
            error: error.message,
        });
    }
};

// ---------------------
// UPDATE INQUIRY
// ---------------------
const updateInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assigned_to, details } = req.body;

        const updates = [];
        const values = [];

        if (status) {
            updates.push("status = ?");
            values.push(status);
        }
        if (priority) {
            updates.push("priority = ?");
            values.push(priority);
        }
        if (assigned_to !== undefined) {
            updates.push("assigned_to = ?");
            values.push(assigned_to);
        }
        if (details) {
            updates.push("details = ?");
            values.push(details);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update",
            });
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE frontdesk_inquiries SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found",
            });
        }

        res.json({
            success: true,
            message: "Inquiry updated successfully",
        });
    } catch (error) {
        console.error("Update inquiry error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update inquiry",
            error: error.message,
        });
    }
};

module.exports = {
    getAllFrontDeskStaff,
    getFrontDeskStaffById,
    createFrontDeskStaff,
    updateFrontDeskStaff,
    deleteFrontDeskStaff,
    logVisitor,
    getVisitorLogs,
    checkoutVisitor,
    createInquiry,
    getInquiries,
    updateInquiry,
};
