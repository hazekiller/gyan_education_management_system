const db = require("../config/database");

async function runMigration() {
    try {
        console.log("Adding student_id column to admissions table...");
        await db.query(`
      ALTER TABLE admissions
      ADD COLUMN student_id INT,
      ADD CONSTRAINT fk_admissions_student
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    `);
        console.log("Migration successful");
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists");
        } else {
            console.error("Migration failed:", error);
        }
    } finally {
        process.exit();
    }
}

runMigration();
