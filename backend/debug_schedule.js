const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "school_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkSchedule() {
  try {
    const dayOfWeek = "Saturday"; // Today is Saturday
    console.log(`Checking schedule for ${dayOfWeek}...`);

    const [rows] = await pool.query(
      `SELECT tt.*, s.name as subject_name, c.name as class_name, sec.name as section_name 
       FROM timetable tt
       LEFT JOIN subjects s ON tt.subject_id = s.id
       LEFT JOIN classes c ON tt.class_id = c.id
       LEFT JOIN sections sec ON tt.section_id = sec.id
       WHERE day_of_week = ?`,
      [dayOfWeek]
    );

    console.log("Found", rows.length, "entries:");
    rows.forEach((row) => {
      console.log(
        `- ${row.class_name} ${row.section_name} (${row.subject_name}): ${row.start_time} - ${row.end_time}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSchedule();
