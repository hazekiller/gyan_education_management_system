const db = require("../config/database");

async function runMigration() {
    const connection = await db.getConnection();
    try {
        console.log("Starting subjects schema update...");
        await connection.beginTransaction();

        // 1. Add columns to subjects table
        console.log("Adding columns to subjects table...");
        try {
            await connection.query(`
        ALTER TABLE subjects
        ADD COLUMN prerequisite_type ENUM('none', 'subject_exam', 'completion') DEFAULT 'none',
        ADD COLUMN subject_nature ENUM('compulsory', 'optional', 'elective') DEFAULT 'compulsory'
      `);
            console.log("Columns added to subjects table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("Columns already exist in subjects table.");
            } else {
                throw err;
            }
        }

        // 2. Create subject_prerequisites table
        console.log("Creating subject_prerequisites table...");
        await connection.query(`
      CREATE TABLE IF NOT EXISTS subject_prerequisites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_id INT NOT NULL,
        prerequisite_subject_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_prereq (subject_id, prerequisite_subject_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log("subject_prerequisites table created/verified.");

        await connection.commit();
        console.log("Migration successful!");
    } catch (error) {
        await connection.rollback();
        console.error("Migration failed:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

runMigration();
