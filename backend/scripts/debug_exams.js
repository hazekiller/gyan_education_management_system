const pool = require('../config/database');

async function debugExams() {
    try {
        console.log('--- Debugging Exams ---');

        const [admins] = await pool.query("SELECT * FROM users WHERE role = 'admin'");
        console.log('Admins found:', admins.map(u => ({ id: u.id, email: u.email })));

        // ... rest of previous checks
        const academic_year = '2024-2025';
        const query = `
      SELECT 
        exams.*,
        classes.name as class_name
      FROM exams
      LEFT JOIN classes ON exams.class_id = classes.id
      WHERE 1=1 AND exams.academic_year = ?
      ORDER BY exams.start_date DESC
    `;
        const [filteredExams] = await pool.query(query, [academic_year]);
        console.log(`Found ${filteredExams.length} exams for ${academic_year}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

debugExams();
