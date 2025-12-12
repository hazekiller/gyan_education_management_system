const pool = require('./config/database');

async function verifyFix() {
    try {
        console.log('Verifying attendance fix...');

        // 1. Check if columns exist
        const [columns] = await pool.query('DESCRIBE attendance');
        const columnNames = columns.map(c => c.Field);
        const requiredColumns = ['subject_id', 'is_submitted', 'submitted_at', 'submitted_by'];

        const missingColumns = requiredColumns.filter(c => !columnNames.includes(c));

        if (missingColumns.length > 0) {
            console.error('FAILED: Missing columns:', missingColumns);
            process.exit(1);
        }
        console.log('PASSED: All required columns present');

        // 2. Simulate markAttendance Logic (Check SQL query validity)
        // We can't easily unit test the controller function without mocking req/res, 
        // but we can test the SQL query it would execute.

        const mockData = {
            student_id: 1,
            class_id: 1,
            section_id: 1,
            subject_id: 1,
            date: '2025-01-01',
            status: 'present',
            marked_by: 1
        };

        try {
            // First cleanup
            await pool.query('DELETE FROM attendance WHERE class_id = ? AND date = ?', [mockData.class_id, mockData.date]);

            // Test Insert
            const query = `INSERT INTO attendance 
                (student_id, class_id, section_id, subject_id, date, status, remarks, marked_by, is_submitted, submitted_at, submitted_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                mockData.student_id,
                mockData.class_id,
                mockData.section_id,
                mockData.subject_id,
                mockData.date,
                mockData.status,
                null,
                mockData.marked_by,
                false,
                null,
                null
            ];

            await pool.query(query, values);
            console.log('PASSED: Insert query executed successfully');

            // Test Select with Join (the one that was failing)
            const selectQuery = `
                SELECT a.*, sub.name as subject_name
                FROM attendance a
                LEFT JOIN subjects sub ON a.subject_id = sub.id
                WHERE a.date = ?
            `;
            await pool.query(selectQuery, [mockData.date]);
            console.log('PASSED: Select query with subject_id join executed successfully');

            // Cleanup
            await pool.query('DELETE FROM attendance WHERE class_id = ? AND date = ?', [mockData.class_id, mockData.date]);

        } catch (error) {
            console.error('FAILED: Database operation failed:', error.message);
            process.exit(1);
        }

        console.log('Verification Complete: All Checks Passed');
        process.exit(0);

    } catch (error) {
        console.error('Verification script error:', error);
        process.exit(1);
    }
}

verifyFix();
