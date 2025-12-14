
const pool = require('../config/database');

async function debugExamData() {
    try {
        const studentId = 3;

        // 1. Check Exams
        const [exams] = await pool.query('SELECT * FROM exams');
        console.log(`Found ${exams.length} exams.`);
        exams.forEach(e => console.log(`- ID: ${e.id}, Name: ${e.name}, Status: ${e.status}, Publish Date: ${e.result_publish_date}`));

        // 2. Check Exam Schedules
        const [schedules] = await pool.query('SELECT * FROM exam_schedules');
        console.log(`Found ${schedules.length} exam schedules.`);

        // 3. Check if we can insert a dummy result for testing
        // We need an exam_id and subject_id from schedules
        if (schedules.length > 0 && exams.length > 0) {
            const schedule = schedules[0];
            console.log(`Attempting to insert dummy result for Student ${studentId}, Exam ${schedule.exam_id}, Subject ${schedule.subject_id}`);
            // Check if result already exists (we know it doesn't from previous check, but good practice)

            // This is just a check, I won't insert unless I'm sure.
            // But for "solving" it, maybe I should insert one to prove it works?
            // No, I should first report to the user that data is missing.
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

debugExamData();
