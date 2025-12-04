const pool = require("../config/database");

async function migrate() {
  try {
    console.log("Starting migration...");

    // Check if column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'attendance' 
      AND COLUMN_NAME = 'subject_id'
    `);

    if (columns.length > 0) {
      console.log("Column subject_id already exists.");
    } else {
      console.log("Adding subject_id column...");
      await pool.query(`
        ALTER TABLE attendance 
        ADD COLUMN subject_id INT NULL,
        ADD CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
      `);
      console.log("Column subject_id added successfully.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
