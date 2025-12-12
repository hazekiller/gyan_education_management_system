const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running migration to add class_teacher_id column...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_class_teacher_id.sql'),
            'utf8'
        );

        // Split SQL statements by semicolon and execute each one
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            await pool.query(statement);
        }

        console.log('✅ Migration completed successfully!');
        console.log('✅ class_teacher_id column added to classes table');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
