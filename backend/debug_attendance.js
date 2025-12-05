const pool = require("./config/database");

async function debug() {
  try {
    console.log("Querying attendance...");
    const [rows] = await pool.query(`
      SELECT 
        a.id, 
        a.subject_id, 
        sub.name as subject_name 
      FROM attendance a 
      LEFT JOIN subjects sub ON a.subject_id = sub.id 
      ORDER BY a.id DESC 
      LIMIT 5
    `);
    console.log("Attendance Records:", rows);

    if (rows.length > 0 && rows[0].subject_id) {
      const [subject] = await pool.query(
        "SELECT * FROM subjects WHERE id = ?",
        [rows[0].subject_id]
      );
      console.log("Subject Record:", subject);
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

debug();
