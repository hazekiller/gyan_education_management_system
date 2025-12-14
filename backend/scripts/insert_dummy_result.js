
const pool = require('../config/database');

async function insertDummyResult() {
    try {
        const studentId = 3;
        const examId = 3; // Using existing exam ID 3
        const subjectId = 10; // Using existing subject ID 10 (from existing result)

        console.log(`Inserting dummy result for Student ${studentId}...`);

        // Check if result already exists
        const [existing] = await pool.query(
            'SELECT id FROM exam_results WHERE student_id = ? AND exam_id = ? AND subject_id = ?',
            [studentId, examId, subjectId]
        );

        if (existing.length > 0) {
            console.log('Result already exists, skipping insert.');
        } else {
            const [result] = await pool.query(
                `INSERT INTO exam_results 
        (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, remarks, entered_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [examId, studentId, subjectId, 45.00, 50, 'A+', 'Excellent', 1]
            );
            console.log('Inserted dummy result with ID:', result.insertId);
        }

        // Verify it exists in the query logic
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
        console.log(`Controller query now finds ${controllerResults.length} results`);
        if (controllerResults.length > 0) {
            console.log('Sample:', controllerResults[0]);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

insertDummyResult();
