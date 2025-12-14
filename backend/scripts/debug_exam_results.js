
const pool = require('../config/database');

async function debugExamResults() {
    try {
        const studentId = 3; // From URL in screenshot
        console.log(`Checking exam results for student ${studentId}...`);

        // Check student existence
        const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
        console.log('Student:', students.length > 0 ? students[0].first_name : 'Not found');

        // Check exam results
        const [results] = await pool.query('SELECT * FROM exam_results WHERE student_id = ?', [studentId]);
        console.log(`Found ${results.length} exam results for student ${studentId}`);
        if (results.length > 0) {
            console.log('Sample result:', results[0]);
        } else {
            // Check if there are ANY exam results
            const [allResults] = await pool.query('SELECT COUNT(*) as count FROM exam_results');
            console.log(`Total exam results in DB: ${allResults[0].count}`);
        }

        // Check query from controller
        const query = `
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
        const [controllerResults] = await pool.query(query, [studentId]);
        console.log(`Controller query found ${controllerResults.length} results`);
        if (controllerResults.length === 0 && results.length > 0) {
            console.log("Difference detected! Checking joins...");
            // Check exams
            const [exams] = await pool.query('SELECT id, name FROM exams');
            console.log("Exams:", exams.map(e => ({ id: e.id, name: e.name })));

            // Check subjects
            const [subjects] = await pool.query('SELECT id, name FROM subjects');
            console.log("Subjects:", subjects.map(s => ({ id: s.id, name: s.name })));
        }


    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

debugExamResults();
