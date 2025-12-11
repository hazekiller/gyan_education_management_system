// File: backend/scripts/add_email_to_students.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const addEmailColumn = async () => {
    let connection;

    try {
        console.log('\n🔄 Adding email column to students table...\n');

        // Create connection to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gyan_school_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');

        // Add email column to students table
        await connection.query(`
      ALTER TABLE students 
      ADD COLUMN email VARCHAR(255) UNIQUE AFTER last_name
    `);

        console.log('✅ Email column added to students table');
        console.log('\n✨ Migration complete!\n');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Email column already exists in students table');
        } else {
            console.error('❌ Error:', error.message);
            throw error;
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
};

// Run the migration
addEmailColumn()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
