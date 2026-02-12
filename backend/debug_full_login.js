require('dotenv').config(); // Load env vars
const pool = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const testFullLogin = async () => {
    try {
        console.log("=== Debugging Login Flow ===");
        const email = 'accountant@gyan.edu';
        const password = 'password123';

        console.log(`1. Fetching user: ${email}`);
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            console.log("❌ User not found");
            process.exit(1);
        }
        const user = users[0];
        console.log(`✅ User found: ID=${user.id}, Role=${user.role}, Active=${user.is_active}`);

        console.log("2. Verifying password...");
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("❌ Invalid password");
            process.exit(1);
        }
        console.log("✅ Password verified");

        console.log("3. Fetching user details...");
        let userDetails = null;
        if (["accountant", "guard", "cleaner", "hr", "staff"].includes(user.role)) {
            const [staff] = await pool.query("SELECT * FROM staff WHERE user_id = ?", [user.id]);
            userDetails = staff[0];
            console.log(`Details found: ${userDetails ? 'Yes' : 'No'} (ID: ${userDetails?.id})`);
        } else {
            console.log("Skipping details fetch for this role");
        }

        console.log("4. Generating JWT...");
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in process.env");
        }
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || "7d",
        });
        console.log("✅ Token generated");

        console.log("5. Constructing response...");
        const responseResponse = {
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    details: userDetails,
                },
            },
        };
        console.log("✅ Response constructed successfully");
        // console.log(JSON.stringify(responseResponse, null, 2));

        console.log("=== Login Flow Success ===");
        process.exit(0);

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error);
        process.exit(1);
    }
};

testFullLogin();
