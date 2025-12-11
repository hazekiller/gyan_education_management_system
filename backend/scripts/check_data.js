const pool = require('../config/database');

async function checkData() {
    try {
        const [students] = await pool.query('SELECT COUNT(*) as count FROM students');
        const [teachers] = await pool.query('SELECT COUNT(*) as count FROM teachers');
        const [staff] = await pool.query('SELECT COUNT(*) as count FROM staff');

        console.log('Database counts:');
        console.log('Students:', students[0].count);
        console.log('Teachers:', teachers[0].count);
        console.log('Staff:', staff[0].count);

        // Check if there's actual data
        if (students[0].count > 0) {
            const [sampleStudents] = await pool.query('SELECT id, first_name, last_name, admission_number FROM students LIMIT 5');
            console.log('\nSample students:');
            console.log(sampleStudents);
        }

        if (teachers[0].count > 0) {
            const [sampleTeachers] = await pool.query('SELECT id, first_name, last_name, employee_id FROM teachers LIMIT 5');
            console.log('\nSample teachers:');
            console.log(sampleTeachers);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
