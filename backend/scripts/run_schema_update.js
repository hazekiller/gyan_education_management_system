const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'update_schema_daily_reports.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon to get individual queries, filtering out empty ones
        const queries = sql.split(';').filter(q => q.trim().length > 0);

        const connection = await pool.getConnection();

        console.log('Running migration...');

        for (const query of queries) {
            if (query.trim()) {
                console.log(`Executing: ${query.substring(0, 50)}...`);
                try {
                    await connection.query(query);
                } catch (err) {
                    // Ignore "Duplicate column name" error if we run this multiple times
                    if (err.code === 'ER_DUP_FIELDNAME') {
                        console.log('Column already exists, skipping.');
                    } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log('Table already exists, skipping.');
                    } else {
                        throw err;
                    }
                }
            }
        }

        console.log('Migration completed successfully.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
