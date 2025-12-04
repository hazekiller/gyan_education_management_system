const db = require("../config/database");

// ==========================================
// CREATE BUS ATTENDANCE REPORT
// ==========================================
exports.createReport = async (req, res, next) => {
    try {
        const {
            report_date,
            route_id,
            vehicle_id,
            attendance_data,
            remarks,
            status = "draft",
        } = req.body;
        const created_by = req.user.id;

        // Validation
        if (!report_date || !route_id || !vehicle_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: report_date, route_id, vehicle_id",
            });
        }

        // Calculate counts from attendance_data
        let total_students = 0;
        let present_count = 0;
        let absent_count = 0;

        if (attendance_data && Array.isArray(attendance_data)) {
            total_students = attendance_data.length;
            present_count = attendance_data.filter(
                (a) => a.status === "present"
            ).length;
            absent_count = attendance_data.filter(
                (a) => a.status === "absent"
            ).length;
        }

        const [result] = await db.query(
            `INSERT INTO bus_attendance_reports 
       (report_date, route_id, vehicle_id, total_students, present_count, absent_count, attendance_data, remarks, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                report_date,
                route_id,
                vehicle_id,
                total_students,
                present_count,
                absent_count,
                JSON.stringify(attendance_data || []),
                remarks,
                status,
                created_by,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Bus attendance report created successfully",
            data: { id: result.insertId },
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// GET ALL BUS ATTENDANCE REPORTS
// ==========================================
exports.getReports = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            route_id,
            vehicle_id,
            date_from,
            date_to,
            status,
        } = req.query;
        const offset = (page - 1) * limit;
        const user = req.user;

        let query = `
      SELECT bar.*, 
        tr.route_name, 
        tv.bus_number, tv.registration_number,
        u.email as creator_email,
        v.email as verifier_email
      FROM bus_attendance_reports bar
      LEFT JOIN transport_routes tr ON bar.route_id = tr.id
      LEFT JOIN transport_vehicles tv ON bar.vehicle_id = tv.id
      LEFT JOIN users u ON bar.created_by = u.id
      LEFT JOIN users v ON bar.verified_by = v.id
      WHERE 1=1
    `;

        const params = [];

        // Filters
        if (route_id) {
            query += " AND bar.route_id = ?";
            params.push(route_id);
        }
        if (vehicle_id) {
            query += " AND bar.vehicle_id = ?";
            params.push(vehicle_id);
        }
        if (date_from) {
            query += " AND bar.report_date >= ?";
            params.push(date_from);
        }
        if (date_to) {
            query += " AND bar.report_date <= ?";
            params.push(date_to);
        }
        if (status) {
            query += " AND bar.status = ?";
            params.push(status);
        }

        // Count total for pagination
        const countQuery = query.replace(
            /SELECT bar\.\*, [\s\S]*? FROM/,
            "SELECT COUNT(*) as total FROM"
        );
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;

        // Get paginated results
        query += " ORDER BY bar.report_date DESC, bar.created_at DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        const [reports] = await db.query(query, params);

        // Parse JSON attendance_data
        reports.forEach((report) => {
            if (report.attendance_data) {
                try {
                    report.attendance_data =
                        typeof report.attendance_data === "string"
                            ? JSON.parse(report.attendance_data)
                            : report.attendance_data;
                } catch (e) {
                    report.attendance_data = [];
                }
            }
        });

        res.json({
            success: true,
            count: reports.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: reports,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// GET REPORT BY ID
// ==========================================
exports.getReportById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [reports] = await db.query(
            `SELECT bar.*, 
        tr.route_name, tr.start_point, tr.end_point,
        tv.bus_number, tv.registration_number, tv.driver_name, tv.driver_phone,
        u.email as creator_email,
        v.email as verifier_email
       FROM bus_attendance_reports bar
       LEFT JOIN transport_routes tr ON bar.route_id = tr.id
       LEFT JOIN transport_vehicles tv ON bar.vehicle_id = tv.id
       LEFT JOIN users u ON bar.created_by = u.id
       LEFT JOIN users v ON bar.verified_by = v.id
       WHERE bar.id = ?`,
            [id]
        );

        if (reports.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Report not found" });
        }

        const report = reports[0];

        // Parse JSON attendance_data
        if (report.attendance_data) {
            try {
                report.attendance_data =
                    typeof report.attendance_data === "string"
                        ? JSON.parse(report.attendance_data)
                        : report.attendance_data;
            } catch (e) {
                report.attendance_data = [];
            }
        }

        res.json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// UPDATE BUS ATTENDANCE REPORT
// ==========================================
exports.updateReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { report_date, attendance_data, remarks, status } = req.body;

        // Calculate counts from attendance_data
        let total_students = 0;
        let present_count = 0;
        let absent_count = 0;

        if (attendance_data && Array.isArray(attendance_data)) {
            total_students = attendance_data.length;
            present_count = attendance_data.filter(
                (a) => a.status === "present"
            ).length;
            absent_count = attendance_data.filter(
                (a) => a.status === "absent"
            ).length;
        }

        const [result] = await db.query(
            `UPDATE bus_attendance_reports 
       SET report_date = ?, total_students = ?, present_count = ?, absent_count = ?, 
           attendance_data = ?, remarks = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
            [
                report_date,
                total_students,
                present_count,
                absent_count,
                JSON.stringify(attendance_data || []),
                remarks,
                status,
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Report not found" });
        }

        res.json({ success: true, message: "Report updated successfully" });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// DELETE BUS ATTENDANCE REPORT
// ==========================================
exports.deleteReport = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM bus_attendance_reports WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Report not found" });
        }

        res.json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// VERIFY BUS ATTENDANCE REPORT
// ==========================================
exports.verifyReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const verified_by = req.user.id;

        const [result] = await db.query(
            `UPDATE bus_attendance_reports 
       SET status = 'verified', verified_by = ?, verified_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
            [verified_by, id]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Report not found" });
        }

        res.json({ success: true, message: "Report verified successfully" });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// GET MY BUS ATTENDANCE (FOR STUDENTS)
// ==========================================
exports.getMyAttendance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, date_from, date_to } = req.query;
        const offset = (page - 1) * limit;

        // Get student ID from user ID
        const [student] = await db.query(
            "SELECT id FROM students WHERE user_id = ?",
            [userId]
        );

        if (student.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Student not found" });
        }

        const studentId = student[0].id;

        // Get student's route allocation (join with routes to get vehicle_id)
        const [allocation] = await db.query(
            `SELECT ta.route_id, tr.vehicle_id 
       FROM transport_allocations ta
       JOIN transport_routes tr ON ta.route_id = tr.id
       WHERE ta.student_id = ? AND ta.status = 'active'`,
            [studentId]
        );

        if (allocation.length === 0) {
            return res.json({
                success: true,
                message: "No transport allocated",
                data: [],
                total: 0,
            });
        }

        const { route_id, vehicle_id } = allocation[0];

        // Build query
        let query = `
      SELECT bar.*, 
        tr.route_name, 
        tv.bus_number, tv.registration_number
      FROM bus_attendance_reports bar
      LEFT JOIN transport_routes tr ON bar.route_id = tr.id
      LEFT JOIN transport_vehicles tv ON bar.vehicle_id = tv.id
      WHERE bar.route_id = ? AND bar.vehicle_id = ?
    `;

        const params = [route_id, vehicle_id];

        if (date_from) {
            query += " AND bar.report_date >= ?";
            params.push(date_from);
        }
        if (date_to) {
            query += " AND bar.report_date <= ?";
            params.push(date_to);
        }

        // Count total
        const countQuery = query.replace(
            /SELECT bar\.\*, [\s\S]*? FROM/,
            "SELECT COUNT(*) as total FROM"
        );
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;

        // Get paginated results
        query += " ORDER BY bar.report_date DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        const [reports] = await db.query(query, params);

        // Parse attendance_data and extract student's attendance
        reports.forEach((report) => {
            if (report.attendance_data) {
                try {
                    const attendanceData =
                        typeof report.attendance_data === "string"
                            ? JSON.parse(report.attendance_data)
                            : report.attendance_data;

                    // Find this student's attendance record
                    const myAttendance = attendanceData.find(
                        (a) => a.student_id === studentId
                    );
                    report.my_status = myAttendance ? myAttendance.status : "unknown";
                    report.my_remarks = myAttendance ? myAttendance.remarks : "";

                    // Don't expose other students' data
                    delete report.attendance_data;
                } catch (e) {
                    report.my_status = "unknown";
                    report.my_remarks = "";
                }
            }
        });

        res.json({
            success: true,
            count: reports.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: reports,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// GET STUDENTS FOR A ROUTE (Helper for creating reports)
// ==========================================
exports.getRouteStudents = async (req, res, next) => {
    try {
        const { route_id } = req.params;

        const [students] = await db.query(
            `SELECT 
        s.id, s.first_name, s.last_name, s.admission_number, s.class_id,
        ta.seat_number,
        ts_pickup.stop_name as pickup_stop,
        ts_drop.stop_name as drop_stop
       FROM transport_allocations ta
       JOIN students s ON ta.student_id = s.id
       LEFT JOIN transport_stops ts_pickup ON ta.pickup_stop_id = ts_pickup.id
       LEFT JOIN transport_stops ts_drop ON ta.drop_stop_id = ts_drop.id
       WHERE ta.route_id = ? AND ta.status = 'active'
       ORDER BY s.first_name, s.last_name`,
            [route_id]
        );

        res.json({
            success: true,
            count: students.length,
            data: students,
        });
    } catch (error) {
        next(error);
    }
};
