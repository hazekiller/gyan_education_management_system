const pool = require("../config/database");

// ---------------------
// CREATE REPORT
// ---------------------
const createReport = async (req, res) => {
    try {
        let {
            teacher_id,
            report_date,
            content,
            remarks,
            // Enhanced fields
            class_id,
            subject_id,
            period_number,
            topics_covered,
            teaching_method,
            homework_assigned,
            students_present,
            students_absent,
            student_engagement,
            challenges_faced,
            achievements,
            resources_used,
            next_class_plan
        } = req.body;
        const created_by = req.user.id;
        const userRole = req.user.role;

        // If teacher is creating their own report, auto-set teacher_id
        if (userRole === 'teacher') {
            const [teacherData] = await pool.query(
                'SELECT id FROM teachers WHERE user_id = ?',
                [req.user.id]
            );
            if (teacherData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Teacher profile not found",
                });
            }
            teacher_id = teacherData[0].id;
        }

        if (!teacher_id || !report_date || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO daily_reports (
                teacher_id, created_by, report_date, content, remarks,
                class_id, subject_id, period_number, topics_covered, teaching_method,
                homework_assigned, students_present, students_absent, student_engagement,
                challenges_faced, achievements, resources_used, next_class_plan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                teacher_id, created_by, report_date, content, remarks,
                class_id || null, subject_id || null, period_number || null,
                topics_covered || null, teaching_method || null,
                homework_assigned || null, students_present || null, students_absent || null,
                student_engagement || null, challenges_faced || null, achievements || null,
                resources_used || null, next_class_plan || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Daily report created successfully",
            data: { id: result.insertId },
        });
    } catch (error) {
        console.error("Create report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create report",
            error: error.message,
        });
    }
};

// ---------------------
// GET ALL REPORTS
// ---------------------
const getReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, teacher_id, date_from, date_to } = req.query;
        const offset = (page - 1) * limit;
        const user = req.user;

        let query = `
      SELECT dr.*, 
        t.first_name as teacher_first_name, t.last_name as teacher_last_name, t.employee_id,
        c.first_name as creator_first_name, c.last_name as creator_last_name
      FROM daily_reports dr
      LEFT JOIN teachers t ON dr.teacher_id = t.id
      LEFT JOIN users u ON dr.created_by = u.id
      LEFT JOIN teachers c ON u.id = c.user_id -- Assuming creators are also teachers/staff (adjust if creators are just users)
      WHERE 1=1
    `;

        // Note: The creator join might need adjustment depending on who 'users' are. 
        // If creators are admins who are not in 'teachers' table, we might need to join with 'staff' or just use 'users' table info.
        // For now, let's just get creator name from users table if possible, or just user email.
        // Let's refine the query to be safer:

        query = `
      SELECT dr.*, 
        t.first_name as teacher_first_name, t.last_name as teacher_last_name, t.employee_id,
        u.email as creator_email,
        c.name as class_name,
        s.name as subject_name, s.code as subject_code
      FROM daily_reports dr
      LEFT JOIN teachers t ON dr.teacher_id = t.id
      LEFT JOIN users u ON dr.created_by = u.id
      LEFT JOIN classes c ON dr.class_id = c.id
      LEFT JOIN subjects s ON dr.subject_id = s.id
      WHERE 1=1
    `;

        const params = [];

        // Role-based access
        if (user.role === 'teacher') {
            // Teachers can only see their own reports
            query += " AND dr.teacher_id = (SELECT id FROM teachers WHERE user_id = ?)";
            params.push(user.id);
        }
        // Admins see all

        if (teacher_id) {
            query += " AND dr.teacher_id = ?";
            params.push(teacher_id);
        }
        if (date_from) {
            query += " AND dr.report_date >= ?";
            params.push(date_from);
        }
        if (date_to) {
            query += " AND dr.report_date <= ?";
            params.push(date_to);
        }

        // Count total for pagination
        const [countResult] = await pool.query(
            "SELECT COUNT(*) as total " + query.substring(query.indexOf("FROM")),
            params
        );
        const total = countResult[0].total;

        query += " ORDER BY dr.report_date DESC, dr.created_at DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        const [reports] = await pool.query(query, params);

        res.json({
            success: true,
            count: reports.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: reports,
        });
    } catch (error) {
        console.error("Get reports error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reports",
            error: error.message,
        });
    }
};

// ---------------------
// GET REPORT BY ID
// ---------------------
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const [reports] = await pool.query(
            `SELECT dr.*, 
        t.first_name as teacher_first_name, t.last_name as teacher_last_name,
        u.email as creator_email,
        c.name as class_name,
        s.name as subject_name, s.subject_code
       FROM daily_reports dr
       LEFT JOIN teachers t ON dr.teacher_id = t.id
       LEFT JOIN users u ON dr.created_by = u.id
       LEFT JOIN classes c ON dr.class_id = c.id
       LEFT JOIN subjects s ON dr.subject_id = s.id
       WHERE dr.id = ?`,
            [id]
        );

        if (reports.length === 0) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.json({ success: true, data: reports[0] });
    } catch (error) {
        console.error("Get report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch report",
            error: error.message,
        });
    }
};

// ---------------------
// UPDATE REPORT
// ---------------------
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            report_date, content, remarks,
            class_id, subject_id, period_number, topics_covered, teaching_method,
            homework_assigned, students_present, students_absent, student_engagement,
            challenges_faced, achievements, resources_used, next_class_plan
        } = req.body;

        const [result] = await pool.query(
            `UPDATE daily_reports 
       SET report_date = ?, content = ?, remarks = ?, 
           class_id = ?, subject_id = ?, period_number = ?,
           topics_covered = ?, teaching_method = ?, homework_assigned = ?,
           students_present = ?, students_absent = ?, student_engagement = ?,
           challenges_faced = ?, achievements = ?, resources_used = ?,
           next_class_plan = ?, updated_at = NOW() 
       WHERE id = ?`,
            [
                report_date, content, remarks,
                class_id || null, subject_id || null, period_number || null,
                topics_covered || null, teaching_method || null, homework_assigned || null,
                students_present || null, students_absent || null, student_engagement || null,
                challenges_faced || null, achievements || null, resources_used || null,
                next_class_plan || null, id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.json({ success: true, message: "Report updated successfully" });
    } catch (error) {
        console.error("Update report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update report",
            error: error.message,
        });
    }
};

// ---------------------
// DELETE REPORT
// ---------------------
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM daily_reports WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
        console.error("Delete report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete report",
            error: error.message,
        });
    }
};

// ---------------------
// ADD FEEDBACK
// ---------------------
const addFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;

        const [result] = await pool.query(
            "UPDATE daily_reports SET feedback = ?, updated_at = NOW() WHERE id = ?",
            [feedback, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.json({ success: true, message: "Feedback added successfully" });
    } catch (error) {
        console.error("Add feedback error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add feedback",
            error: error.message,
        });
    }
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    addFeedback,
};
