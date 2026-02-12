const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedRoles = async () => {
    try {
        console.log('Seeding roles...');

        // 1. Update Enum
        try {
            await pool.query("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('super_admin','principal','vice_principal','hod','teacher','student','accountant','guard','cleaner','hr','founder','staff') NOT NULL");
            console.log('Updated users table role enum.');
        } catch (err) {
            console.log('Enum might already be updated or error:', err.message);
        }

        // 2. Define Users to Seed
        const usersToSeed = [
            {
                email: 'accountant@gyan.edu',
                password: 'password123',
                role: 'accountant',
                firstName: 'Main',
                lastName: 'Accountant'
            },
            {
                email: 'hr@gyan.edu',
                password: 'password123',
                role: 'hr',
                firstName: 'Head',
                lastName: 'HR'
            },
            {
                email: 'founder@gyan.edu',
                password: 'password123',
                role: 'founder',
                firstName: 'School',
                lastName: 'Founder'
            },
            {
                email: 'staff@gyan.edu',
                password: 'password123',
                role: 'staff',
                firstName: 'General',
                lastName: 'Staff'
            }
        ];

        for (const user of usersToSeed) {
            // Check if user exists
            const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [user.email]);

            if (existing.length === 0) {
                const hashedPassword = await bcrypt.hash(user.password, 10);

                // Insert into users
                const [userResult] = await pool.query(
                    'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, 1)',
                    [user.email, hashedPassword, user.role]
                );

                const userId = userResult.insertId;
                console.log(`Created user: ${user.email} (ID: ${userId})`);

                // Insert into staff table (except founder maybe? but for simplicity let's put them in staff or just leave user)
                // The current schema has a 'staff' table. HR and Accountant should probably be in there.
                // Founder might not be in staff table, but for consistency in "getProfile", we might need a profile.
                // Let's add HR, Accountant, Staff to 'staff' table. Founder might be special.

                if (['accountant', 'hr', 'staff'].includes(user.role)) {
                    await pool.query(
                        `INSERT INTO staff (user_id, employee_id, first_name, last_name, phone, designation, joining_date, status, date_of_birth, gender)
                 VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'active', '1990-01-01', 'male')`,
                        [
                            userId,
                            `EMP${userId.toString().padStart(3, '0')}`,
                            user.firstName,
                            user.lastName,
                            '9800000000', // Dummy phone
                            user.role.toUpperCase(),
                        ]
                    );
                    console.log(`Created staff profile for ${user.role}`);
                }
            } else {
                console.log(`User ${user.email} already exists.`);
            }
        }

        console.log('Seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedRoles();
