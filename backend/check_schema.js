const pool = require('./config/database');

async function checkSchema() {
    try {
        console.log('Checking schema for table: attendance');
        const [rows] = await pool.query('DESCRIBE attendance');
        console.log('Columns in attendance table:');
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
