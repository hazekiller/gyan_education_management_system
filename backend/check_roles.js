const db = require("./config/database");

const checkRoles = async () => {
    try {
        const [users] = await db.query("SELECT id, email, role FROM users LIMIT 10");
        console.log("Users:", users);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkRoles();
