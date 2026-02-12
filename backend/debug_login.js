const pool = require('./config/database');
const bcrypt = require('bcryptjs');

const testLogin = async () => {
    try {
        console.log("Testing login for accountant@gyan.edu");
        const email = 'accountant@gyan.edu';
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            console.log("User not found");
            return;
        }

        const user = users[0];
        console.log("User found:", user.id, user.role);

        if (["accountant", "guard", "cleaner", "hr", "staff"].includes(user.role)) {
            console.log("Attempting to fetch staff details...");
            try {
                const [staff] = await pool.query(
                    "SELECT * FROM staff WHERE user_id = ?",
                    [user.id]
                );
                console.log("Staff query result:", staff);
            } catch (err) {
                console.error("Error fetching staff:", err);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

testLogin();
