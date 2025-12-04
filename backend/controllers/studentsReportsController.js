const pool = require('../config/database');

// Get comprehensive student report with all activities
const getComprehensiveReport = async (req, res) => {
    try {
        const { id } = req.params;

        // Get student basic info
        const [students] = await pool.query(`
      SELECT 
        s.*,
        c.name as class_name,
        sec.name as section_name,
        u.email
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = students[0];

        // Get attendance summary
        const [attendanceSummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days
      FROM attendance
      WHERE student_id = ?
    `, [id]);

        // Get exam results summary
        const [examResults] = await pool.query(`
      SELECT 
        COUNT(DISTINCT er.exam_id) as total_exams,
        AVG(er.marks_obtained) as average_marks,
        SUM(er.marks_obtained) as total_marks_obtained,
        SUM(er.max_marks) as total_max_marks
      FROM exam_results er
      WHERE er.student_id = ?
    `, [id]);

        // Get assignment summary
        const [assignmentSummary] = await pool.query(`
      SELECT 
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT asub.id) as submitted_assignments,
        AVG(asub.marks_obtained) as average_marks
      FROM assignments a
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      WHERE a.class_id = ? AND a.status = 'active'
    `, [id, student.class_id]);

        // Get fee summary
        const [feeSummary] = await pool.query(`
      SELECT 
        COALESCE(SUM(fs.amount), 0) as total_fee,
        COALESCE(SUM(fp.amount_paid), 0) as total_paid,
        COALESCE(SUM(fs.amount), 0) - COALESCE(SUM(fp.amount_paid), 0) as balance
      FROM fee_structure fs
      LEFT JOIN fee_payments fp ON fs.id = fp.fee_structure_id AND fp.student_id = ?
      WHERE fs.class_id = ? AND fs.is_active = 1
    `, [id, student.class_id]);

        // Get transport info
        const [transportInfo] = await pool.query(`
      SELECT 
        ta.*,
        tr.route_name,
        tr.start_point,
        tr.end_point,
        tr.driver_name,
        tr.driver_phone,
        tv.bus_number,
        tv.registration_number,
        tv.capacity
      FROM transport_allocations ta
      LEFT JOIN transport_routes tr ON ta.route_id = tr.id
      LEFT JOIN transport_vehicles tv ON tr.vehicle_id = tv.id
      WHERE ta.student_id = ? AND ta.status = 'active'
      LIMIT 1
    `, [id]);

        // Get hostel info
        const [hostelInfo] = await pool.query(`
      SELECT 
        ha.*,
        hr.room_number,
        hr.building_name,
        hr.type as room_type,
        hr.capacity
      FROM hostel_allocations ha
      LEFT JOIN hostel_rooms hr ON ha.room_id = hr.id
      WHERE ha.student_id = ? AND ha.status = 'active'
      LIMIT 1
    `, [id]);

        // Get library summary
        const [librarySummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'issued' THEN 1 ELSE 0 END) as current_books,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_books,
        SUM(fine_amount) as total_fines
      FROM library_transactions
      WHERE user_id = ? AND user_type = 'student'
    `, [student.user_id]);

        res.json({
            success: true,
            data: {
                student,
                attendance: attendanceSummary[0],
                exams: examResults[0],
                assignments: assignmentSummary[0],
                fees: feeSummary[0],
                transport: transportInfo[0] || null,
                hostel: hostelInfo[0] || null,
                library: librarySummary[0]
            }
        });
    } catch (error) {
        console.error('Get comprehensive report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comprehensive report',
            error: error.message
        });
    }
};

// Get detailed attendance report
const getAttendanceReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT 
        a.*,
        c.name as class_name,
        sec.name as section_name,
        u.email as marked_by_name
      FROM attendance a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      LEFT JOIN users u ON a.marked_by = u.id
      WHERE a.student_id = ?
    `;
        const params = [id];

        if (start_date) {
            query += ' AND a.date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND a.date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY a.date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [attendance] = await pool.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM attendance WHERE student_id = ?';
        const countParams = [id];

        if (start_date) {
            countQuery += ' AND date >= ?';
            countParams.push(start_date);
        }
        if (end_date) {
            countQuery += ' AND date <= ?';
            countParams.push(end_date);
        }

        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            data: attendance,
            pagination: {
                total: countResult[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance report',
            error: error.message
        });
    }
};

// Get detailed exam results report
const getExamReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { academic_year } = req.query;

        let query = `
      SELECT 
        er.*,
        e.name as exam_name,
        e.exam_type,
        e.start_date,
        e.end_date,
        s.name as subject_name,
        s.code as subject_code
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      LEFT JOIN subjects s ON er.subject_id = s.id
      WHERE er.student_id = ?
    `;
        const params = [id];

        if (academic_year) {
            query += ' AND e.academic_year = ?';
            params.push(academic_year);
        }

        query += ' ORDER BY e.start_date DESC, s.name ASC';

        const [results] = await pool.query(query, params);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Get exam report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exam report',
            error: error.message
        });
    }
};

// Get detailed assignment report
const getAssignmentReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, limit = 50, offset = 0 } = req.query;

        // Get student's class
        const [students] = await pool.query('SELECT class_id, section_id FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const { class_id, section_id } = students[0];

        let query = `
      SELECT 
        a.*,
        s.name as subject_name,
        asub.id as submission_id,
        asub.marks_obtained,
        asub.feedback,
        asub.status as submission_status,
        asub.submitted_at,
        asub.graded_at
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.id
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      WHERE a.class_id = ? AND a.section_id = ?
    `;
        const params = [id, class_id, section_id];

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.due_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [assignments] = await pool.query(query, params);

        res.json({
            success: true,
            data: assignments
        });
    } catch (error) {
        console.error('Get assignment report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assignment report',
            error: error.message
        });
    }
};

// Get detailed fee report
const getFeeReport = async (req, res) => {
    try {
        const { id } = req.params;

        // Get student's class
        const [students] = await pool.query('SELECT class_id FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const { class_id } = students[0];

        // Get fee structure
        const [feeStructure] = await pool.query(`
      SELECT 
        fs.*,
        fh.name as fee_head_name
      FROM fee_structure fs
      LEFT JOIN fee_heads fh ON fs.fee_head_id = fh.id
      WHERE fs.class_id = ? AND fs.is_active = 1
      ORDER BY fs.created_at DESC
    `, [class_id]);

        // Get payment history
        const [payments] = await pool.query(`
      SELECT 
        fp.*,
        fs.fee_type,
        fh.name as fee_head_name,
        u.email as collected_by_name
      FROM fee_payments fp
      JOIN fee_structure fs ON fp.fee_structure_id = fs.id
      LEFT JOIN fee_heads fh ON fs.fee_head_id = fh.id
      LEFT JOIN users u ON fp.collected_by = u.id
      WHERE fp.student_id = ?
      ORDER BY fp.payment_date DESC
    `, [id]);

        res.json({
            success: true,
            data: {
                fee_structure: feeStructure,
                payments: payments
            }
        });
    } catch (error) {
        console.error('Get fee report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fee report',
            error: error.message
        });
    }
};

// Get transport report
const getTransportReport = async (req, res) => {
    try {
        const { id } = req.params;

        // Get transport allocation
        const [transport] = await pool.query(`
      SELECT 
        ta.*,
        tr.route_name,
        tr.start_point,
        tr.end_point,
        tr.driver_name as route_driver_name,
        tr.driver_phone as route_driver_phone,
        tv.bus_number,
        tv.registration_number,
        tv.capacity,
        tv.driver_name,
        tv.driver_phone,
        tv.status as vehicle_status
      FROM transport_allocations ta
      LEFT JOIN transport_routes tr ON ta.route_id = tr.id
      LEFT JOIN transport_vehicles tv ON tr.vehicle_id = tv.id
      WHERE ta.student_id = ? AND ta.status = 'active'
    `, [id]);

        // Get bus attendance if exists
        const [busAttendance] = await pool.query(`
      SELECT 
        bar.*,
        tr.route_name
      FROM bus_attendance_reports bar
      JOIN transport_routes tr ON bar.route_id = tr.id
      WHERE JSON_CONTAINS(bar.attendance_data, JSON_OBJECT('student_id', ?))
      ORDER BY bar.report_date DESC
      LIMIT 30
    `, [id]);

        res.json({
            success: true,
            data: {
                transport_info: transport[0] || null,
                bus_attendance: busAttendance
            }
        });
    } catch (error) {
        console.error('Get transport report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transport report',
            error: error.message
        });
    }
};

// Get hostel report
const getHostelReport = async (req, res) => {
    try {
        const { id } = req.params;

        const [hostel] = await pool.query(`
      SELECT 
        ha.*,
        hr.room_number,
        hr.building_name,
        hr.type as room_type,
        hr.capacity,
        hr.current_occupancy,
        hr.status as room_status
      FROM hostel_allocations ha
      LEFT JOIN hostel_rooms hr ON ha.room_id = hr.id
      WHERE ha.student_id = ?
      ORDER BY ha.allocation_date DESC
    `, [id]);

        res.json({
            success: true,
            data: hostel
        });
    } catch (error) {
        console.error('Get hostel report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hostel report',
            error: error.message
        });
    }
};

// Get library report
const getLibraryReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;

        // Get student's user_id
        const [students] = await pool.query('SELECT user_id FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const { user_id } = students[0];

        let query = `
      SELECT 
        lt.*,
        lb.book_title,
        lb.author,
        lb.isbn,
        lb.category,
        u.email as issued_by_name
      FROM library_transactions lt
      JOIN library_books lb ON lt.book_id = lb.id
      LEFT JOIN users u ON lt.issued_by = u.id
      WHERE lt.user_id = ? AND lt.user_type = 'student'
    `;
        const params = [user_id];

        if (status) {
            query += ' AND lt.status = ?';
            params.push(status);
        }

        query += ' ORDER BY lt.issue_date DESC';

        const [transactions] = await pool.query(query, params);

        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Get library report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch library report',
            error: error.message
        });
    }
};

module.exports = {
    getComprehensiveReport,
    getAttendanceReport,
    getExamReport,
    getAssignmentReport,
    getFeeReport,
    getTransportReport,
    getHostelReport,
    getLibraryReport
};
