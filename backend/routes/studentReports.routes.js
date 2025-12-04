const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const {
    getComprehensiveReport,
    getAttendanceReport,
    getExamReport,
    getAssignmentReport,
    getFeeReport,
    getTransportReport,
    getHostelReport,
    getLibraryReport
} = require('../controllers/studentsReportsController');

// All routes require authentication
router.use(authenticate);

// Get comprehensive report - requires 'read' permission for students
router.get(
    '/:id/comprehensive-report',
    requirePermission('students', 'read'),
    getComprehensiveReport
);

// Get attendance report - requires 'read' permission for attendance
router.get(
    '/:id/reports/attendance',
    requirePermission('attendance', 'read'),
    getAttendanceReport
);

// Get exam report - requires 'read' permission for exams
router.get(
    '/:id/reports/exams',
    requirePermission('exams', 'read'),
    getExamReport
);

// Get assignment report - requires 'read' permission for assignments
router.get(
    '/:id/reports/assignments',
    requirePermission('assignments', 'read'),
    getAssignmentReport
);

// Get fee report - requires 'read' permission for fees
router.get(
    '/:id/reports/fees',
    requirePermission('fees', 'read'),
    getFeeReport
);

// Get transport report - requires 'read' permission for transport
router.get(
    '/:id/reports/transport',
    requirePermission('transport', 'read'),
    getTransportReport
);

// Get hostel report - requires 'read' permission for hostel
router.get(
    '/:id/reports/hostel',
    requirePermission('hostel', 'read'),
    getHostelReport
);

// Get library report - requires 'read' permission for library
router.get(
    '/:id/reports/library',
    requirePermission('library', 'read'),
    getLibraryReport
);

module.exports = router;
