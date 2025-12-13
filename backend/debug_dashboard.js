const pool = require("./config/database");

async function simulateDashboardStats() {
    try {
        console.log("Starting simulation...");

        // Get counts
        const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students WHERE status = "active"');
        console.log("Students:", studentCount[0].count);

        const [teacherCount] = await pool.query('SELECT COUNT(*) as count FROM teachers WHERE status = "active"');
        console.log("Teachers:", teacherCount[0].count);

        const [classCount] = await pool.query('SELECT COUNT(*) as count FROM classes WHERE is_active = 1');
        console.log("Classes:", classCount[0].count);

        const [staffCount] = await pool.query('SELECT COUNT(*) as count FROM staff WHERE status = "active"');
        console.log("Staff:", staffCount[0].count);

        // Get today's attendance
        const today = new Date().toISOString().split("T")[0];
        const [attendanceStats] = await pool.query(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM attendance
      WHERE date = ?`,
            [today]
        );
        console.log("Attendance Today:", attendanceStats[0]);

        // === Fee Statistics (Current Month) ===
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        console.log(`Checking fees for Month: ${currentMonth}, Year: ${currentYear}`);

        // 1. Collected This Month
        const [collectedRes] = await pool.query(
            `SELECT SUM(amount_paid) as total 
       FROM fee_payments 
       WHERE MONTH(payment_date) = ? AND YEAR(payment_date) = ? AND status = 'completed'`,
            [currentMonth, currentYear]
        );
        const collectedAmount = collectedRes[0].total || 0;
        console.log("Collected Amount:", collectedAmount);

        // 2. Expected Revenue This Month
        const [feeStructures] = await pool.query(
            `SELECT fs.id, fs.class_id, fs.amount, fs.period_type, fs.due_date 
       FROM fee_structure fs 
       WHERE fs.is_active = 1`
        );
        console.log("Active Fee Structures:", feeStructures.length);

        const [classStudentCounts] = await pool.query(
            `SELECT class_id, COUNT(*) as count FROM students WHERE status = 'active' GROUP BY class_id`
        );
        const studentCountMap = {};
        classStudentCounts.forEach(c => {
            studentCountMap[c.class_id] = c.count;
        });
        console.log("Student Counts per Class:", studentCountMap);

        let expectedAmount = 0;
        for (const fee of feeStructures) {
            const studentsInClass = studentCountMap[fee.class_id] || 0;
            if (studentsInClass === 0) continue;

            let isApplicable = false;
            if (fee.period_type === 'monthly') {
                isApplicable = true;
            } else if (fee.due_date) {
                const dueDate = new Date(fee.due_date);
                if (dueDate.getMonth() + 1 === currentMonth && dueDate.getFullYear() === currentYear) {
                    isApplicable = true;
                }
            }

            if (isApplicable) {
                console.log(`- Fee applicable: Class ${fee.class_id}, Amount ${fee.amount}, Students ${studentsInClass}`);
                expectedAmount += parseFloat(fee.amount) * studentsInClass;
            }
        }
        console.log("Expected Amount:", expectedAmount);

        const pendingAmount = Math.max(0, expectedAmount - collectedAmount);
        console.log("Pending Amount:", pendingAmount);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

simulateDashboardStats();
