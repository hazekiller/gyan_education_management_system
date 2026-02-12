const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const migrate = async () => {
    try {
        const sqlPath = path.join(__dirname, '../migrations/create_expenses_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration successful: expenses table created.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
