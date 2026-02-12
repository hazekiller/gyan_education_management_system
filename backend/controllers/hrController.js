const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Total Staff Count
        const [staffCount] = await db.query("SELECT COUNT(*) as count FROM staff WHERE status = 'active'");

        // 2. Total Teacher Count
        const [teacherCount] = await db.query("SELECT COUNT(*) as count FROM teachers WHERE status = 'active'");

        // 3. Pending Leave Requests
        const [leaveRequests] = await db.query("SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending'");

        res.json({
            success: true,
            data: {
                totalStaff: staffCount[0].count,
                totalTeachers: teacherCount[0].count,
                totalEmployees: staffCount[0].count + teacherCount[0].count,
                pendingLeaves: leaveRequests[0].count,
            }
        });
    } catch (error) {
        console.error('Error fetching HR stats:', error);
        res.status(500).json({ message: 'Error fetching HR stats' });
    }
};
