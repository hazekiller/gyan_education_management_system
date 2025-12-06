const pool = require('./config/database');

async function describeTable() {
    try {
        const [rows] = await pool.query('DESCRIBE attendance');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

describeTable();
