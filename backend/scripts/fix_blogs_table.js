// Script to fix the blogs table by adding AUTO_INCREMENT
const pool = require("../config/database");

async function fixBlogsTable() {
  try {
    console.log("🔧 Fixing blogs table...");

    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'blogs'");

    if (tables.length === 0) {
      console.log("📝 Creating blogs table...");
      await pool.query(`
        CREATE TABLE blogs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          author_id INT NOT NULL,
          status ENUM('draft', 'published', 'archived') DEFAULT 'published',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_author (author_id),
          INDEX idx_status (status),
          INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ Blogs table created successfully!");
    } else {
      console.log("📝 Table exists, checking structure...");

      // Get current table structure
      const [columns] = await pool.query(
        "SHOW COLUMNS FROM blogs WHERE Field = 'id'"
      );

      if (columns.length > 0) {
        const idColumn = columns[0];
        console.log("Current id column:", idColumn);

        if (!idColumn.Extra.includes("auto_increment")) {
          console.log("⚠️  ID column missing AUTO_INCREMENT, fixing...");

          // Modify column to add AUTO_INCREMENT and PRIMARY KEY
          await pool.query(
            "ALTER TABLE blogs MODIFY id INT AUTO_INCREMENT PRIMARY KEY"
          );

          console.log("✅ AUTO_INCREMENT and PRIMARY KEY added to id column!");
        } else {
          console.log("✅ Table already has AUTO_INCREMENT on id column");
        }
      }
    }

    console.log("✅ Blogs table is ready!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing blogs table:", error);
    process.exit(1);
  }
}

fixBlogsTable();
