const pool = require('../config/database');

async function debugExamSchedules() {
    try {
        // 1. Get the most recent exam
        const [exams] = await pool.query('SELECT * FROM exams ORDER BY id DESC LIMIT 1');
        if (exams.length === 0) {
            console.log('No exams found.');
            return;
        }
        const exam = exams[0];
        console.log('Most recent exam:', { id: exam.id, name: exam.name });

        // 2. Get schedules for this exam
        const [schedules] = await pool.query('SELECT * FROM exam_schedule WHERE exam_id = ?', [exam.id]);
        console.log(`Found ${schedules.length} schedules for exam ${exam.id}`);

        if (schedules.length > 0) {
            console.log('Schedules:', schedules);
        } else {
            console.log('NO SCHEDULES FOUND. This explains why the dropdown is empty.');
        }

        // 3. Check if there are subjects that COULD be scheduled (class subjects)
        const [subjects] = await pool.query('SELECT * FROM class_subjects WHERE class_id = ?', [exam.class_id]);
        console.log(`Found ${subjects.length} subjects assigned to class ${exam.class_id}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

debugExamSchedules();
