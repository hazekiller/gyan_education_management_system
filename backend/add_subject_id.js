const pool = require('./config/database');

async function alterTable() {
    try {
        console.log("Adding subject_id column...");
        await pool.query('ALTER TABLE attendance ADD COLUMN subject_id INT(11) NULL AFTER section_id');
        console.log("Adding foreign key constraint...");
        // Check if subjects table exists and has id
        await pool.query('ALTER TABLE attendance ADD CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL');
        console.log("Migration successful");
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists");
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

alterTable();
