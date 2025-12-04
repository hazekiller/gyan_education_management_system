// Quick script to verify the blogs table structure
const pool = require("../config/database");

async function verifyBlogsTable() {
  try {
    console.log("🔍 Verifying blogs table structure...\n");

    const [columns] = await pool.query("SHOW COLUMNS FROM blogs");
    console.log("Table structure:");
    console.table(columns);

    console.log("\n✅ Blogs table is ready for use!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifyBlogsTable();
