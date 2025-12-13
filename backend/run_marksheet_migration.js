const db = require("./config/database");

const createMarksheetsTable = async () => {
    try {
        console.log("Creating marksheets table...");

        const query = `
      CREATE TABLE IF NOT EXISTS marksheets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        template_type ENUM('exam', 'tournament', 'other') NOT NULL DEFAULT 'exam',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

        await db.query(query);
        console.log("✅ marksheets table created successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating marksheets table:", error);
        process.exit(1);
    }
};

createMarksheetsTable();
