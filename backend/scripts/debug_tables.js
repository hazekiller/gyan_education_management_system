const pool = require('../config/database');

async function debugTables() {
    try {
        console.log('Checking tables...');
        const [tables] = await pool.query('SHOW TABLES');
        console.log(tables);
        process.exit(0);
    } catch (error) {
        console.error('Error querying tables:', error);
        process.exit(1);
    }
}

debugTables();
