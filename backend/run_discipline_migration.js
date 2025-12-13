const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running migration to create discipline_records table...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_discipline_table.sql'),
            'utf8'
        );

        // Split SQL statements by semicolon and execute each one
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            console.log('Executing:', statement);
            await pool.query(statement);
        }

        console.log('✅ Migration completed successfully!');
        console.log('✅ discipline_records table created');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
