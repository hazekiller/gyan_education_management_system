const pool = require("./config/database");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    const migrationPath = path.join(
      __dirname,
      "scripts/migrations/006_fix_attendance_unique_constraint.sql"
    );
    console.log("Reading migration from:", migrationPath);
    const sql = fs.readFileSync(migrationPath, "utf8");
    const statements = sql.split(";").filter((s) => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(
          "Executing:",
          statement.substring(0, 50).replace(/\n/g, " ") + "..."
        );
        await pool.query(statement);
      }
    }
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

runMigration();
