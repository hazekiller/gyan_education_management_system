const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed, assuming run from backend/scripts or backend/

const updateTimetableEnum = async () => {
    let connection;
    try {
        console.log('🔄 Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gyan_school_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');

        console.log('🔄 Altering timetable table to include sunday...');

        // MODIFY COLUMN to include sunday
        // Note: We include all existing days plus sunday
        await connection.query(`
      ALTER TABLE timetable 
      MODIFY COLUMN day_of_week ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL
    `);

        console.log('✅ successfully updated day_of_week ENUM in timetable table');

    } catch (error) {
        console.error('❌ Error updating database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

updateTimetableEnum();
