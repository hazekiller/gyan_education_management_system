const db = require("../config/database");

async function debugConversion() {
    try {
        console.log("--- Latest Admissions ---");
        const [admissions] = await db.query("SELECT id, application_number, first_name, status, student_id, class_applied_for FROM admissions ORDER BY id DESC LIMIT 5");
        console.table(admissions);

        console.log("\n--- Latest Students ---");
        const [students] = await db.query("SELECT id, user_id, first_name, class_id, status, created_at FROM students ORDER BY id DESC LIMIT 5");
        console.table(students);

        console.log("\n--- Latest Users ---");
        const [users] = await db.query("SELECT id, email, role, is_active FROM users ORDER BY id DESC LIMIT 5");
        console.table(users);

    } catch (error) {
        console.error("Debug error:", error);
    } finally {
        process.exit();
    }
}

debugConversion();
