const pool = require('./config/database');

async function createTable() {
  try {
    console.log("Creating subject_prerequisites table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subject_prerequisites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        prerequisite_subject_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_prerequisite (subject_id, prerequisite_subject_id)
      )
    `);
    console.log("Table created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create table:", error);
    process.exit(1);
  }
}

createTable();
