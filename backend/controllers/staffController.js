const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const path = require("path");
const fs = require("fs");

// ---------------------
// GET ALL STAFF
// ---------------------
const getAllStaff = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = `
      SELECT s.*, u.email, u.is_active, u.last_login, s.is_frontdesk, s.shift_timing 
      FROM staff s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += " AND s.status = ?";
            params.push(status);
        }
        if (search) {
            const searchTerm = `%${search}%`;
            query +=
                " AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.employee_id LIKE ?)";
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY s.first_name, s.last_name";
        const [staff] = await pool.query(query, params);

        res.json({
            success: true,
            count: staff.length,
            data: staff,
        });
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch staff",
            error: error.message,
        });
    }
};

// ---------------------
// GET STAFF BY ID
// ---------------------
const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;

        const [staff] = await pool.query(
            `SELECT s.*, u.email, u.is_active, u.last_login, u.created_at as account_created
       FROM staff s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
            [id]
        );

        if (staff.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Staff member not found" });
        }

        res.json({ success: true, data: staff[0] });
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch staff member",
            error: error.message,
        });
    }
};

// ---------------------
// CREATE STAFF
// ---------------------
const createStaff = async (req, res) => {
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
            designation,
            department,
            joining_date,
            salary,
            shift_timing,
            is_frontdesk,
            status,
        } = req.body;

        if (
            !email ||
            !employee_id ||
            !first_name ||
            !last_name ||
            !date_of_birth ||
            !gender ||
            !phone ||
            !designation
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
            "SELECT id FROM staff WHERE employee_id = ?",
            [employee_id]
        );
        if (existingEmp.length > 0) {
            await connection.rollback();
            return res
                .status(409)
                .json({ success: false, message: "Employee ID already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password || "Staff@123", 10);

        // Determine role based on designation
        let role = "cleaner"; // default
        const designationLower = designation.toLowerCase();
        if (designationLower.includes("accountant")) {
            role = "accountant";
        } else if (designationLower.includes("guard") || designationLower.includes("security")) {
            role = "guard";
        }

        // Create user
        const [userResult] = await connection.query(
            "INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)",
            [email, hashedPassword, role, true]
        );
        const userId = userResult.insertId;

        // Handle profile photo
        let profilePhotoPath = null;
        if (req.file) {
            profilePhotoPath = req.file.path.replace(/\\/g, "/"); // Windows fix
        }

        // Create staff record
        const [staffResult] = await connection.query(
            `INSERT INTO staff (
        user_id, employee_id, first_name, middle_name, last_name,
        date_of_birth, gender, blood_group, address, city, state, pincode,
        phone, emergency_contact, designation, department,
        joining_date, salary, shift_timing, is_frontdesk, profile_photo, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                designation,
                department || "General",
                joining_date || new Date(),
                salary || null,
                shift_timing || null,
                is_frontdesk === true || is_frontdesk === 'true' ? 1 : 0,
                profilePhotoPath,
                status || "active",
            ]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            message: "Staff member created successfully",
            data: { id: staffResult.insertId, user_id: userId, email },
        });
    } catch (error) {
        await connection.rollback();
        console.error("Create staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create staff member",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

// ---------------------
// UPDATE STAFF
// ---------------------
const updateStaff = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const updateData = { ...req.body };

        // 1. Check if staff exists
        const [existing] = await connection.query(
            "SELECT id, user_id FROM staff WHERE id = ?",
            [id]
        );
        if (existing.length === 0) {
            await connection.rollback();
            return res
                .status(404)
                .json({ success: false, message: "Staff member not found" });
        }

        const staff = existing[0];

        // 2. Handle User table updates (Email)
        if (updateData.email) {
            // Check if email is being changed and if it's already taken
            const [emailCheck] = await connection.query(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                [updateData.email, staff.user_id]
            );
            if (emailCheck.length > 0) {
                await connection.rollback();
                return res
                    .status(409)
                    .json({ success: false, message: "Email already exists" });
            }

            await connection.query("UPDATE users SET email = ? WHERE id = ?", [
                updateData.email,
                staff.user_id,
            ]);
            delete updateData.email; // Remove from staff update
        }

        // 3. Handle Staff table updates
        // Remove protected/non-staff fields
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
                `UPDATE staff SET ${setClause}, updated_at = NOW() WHERE id = ?`,
                values
            );
        }

        await connection.commit();
        res.json({ success: true, message: "Staff member updated successfully" });
    } catch (error) {
        await connection.rollback();
        console.error("Update staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update staff member",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

// ---------------------
// DELETE STAFF
// ---------------------
const deleteStaff = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;

        const [staff] = await connection.query(
            "SELECT user_id FROM staff WHERE id = ?",
            [id]
        );
        if (!staff.length) {
            await connection.rollback();
            return res
                .status(404)
                .json({ success: false, message: "Staff member not found" });
        }

        const userId = staff[0].user_id;
        await connection.query("DELETE FROM staff WHERE id = ?", [id]);
        if (userId)
            await connection.query("DELETE FROM users WHERE id = ?", [userId]);

        await connection.commit();
        res.json({ success: true, message: "Staff member deleted successfully" });
    } catch (error) {
        await connection.rollback();
        console.error("Delete staff error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete staff member",
            error: error.message,
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
};
