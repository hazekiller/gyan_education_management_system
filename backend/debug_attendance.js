const pool = require('./config/database');

async function checkAttendance() {
    try {
        const [rows] = await pool.query('SELECT * FROM attendance ORDER BY date DESC LIMIT 10');
        console.log('Attendance Records:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAttendance();
