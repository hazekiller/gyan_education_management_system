const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDemoAccounts = async () => {
    try {
        console.log('--- Starting Demo Account Seeding ---');

        // Update Enum to include all required roles
        try {
            await pool.query("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('super_admin','principal','vice_principal','hod','teacher','student','accountant','guard','cleaner','hr','staff') NOT NULL");
            console.log('  Updated users table role enum.');
        } catch (err) {
            console.log('  Enum might already be updated or error:', err.message);
        }

        const demoUsers = [
            {
                email: 'admin@gyan.edu',
                password: 'Admin@123',
                role: 'super_admin',
                firstName: 'Super',
                lastName: 'Admin'
            },
            {
                email: 'teacher@gyan.edu',
                password: 'Teacher@123',
                role: 'teacher',
                firstName: 'Demo',
                lastName: 'Teacher'
            },
            {
                email: 'student@gyan.edu',
                password: 'Student@123',
                role: 'student',
                firstName: 'Demo',
                lastName: 'Student'
            },
            {
                email: 'accountant@gyan.edu',
                password: 'Accountant@123',
                role: 'accountant',
                firstName: 'Demo',
                lastName: 'Accountant'
            },
            {
                email: 'hr@gyan.edu',
                password: 'HR@123',
                role: 'hr',
                firstName: 'Demo',
                lastName: 'HR'
            },
            {
                email: 'guard@gyan.edu',
                password: 'Guard@123',
                role: 'guard',
                firstName: 'Demo',
                lastName: 'Guard'
            }
        ];

        for (const user of demoUsers) {
            console.log(`Processing ${user.role}: ${user.email}...`);

            // Check if user exists
            const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);
            let userId;

            const hashedPassword = await bcrypt.hash(user.password, 10);

            if (existing.length === 0) {
                // Insert new user
                const [userResult] = await pool.query(
                    'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, 1)',
                    [user.email, hashedPassword, user.role]
                );
                userId = userResult.insertId;
                console.log(`  Added user with ID: ${userId}`);
            } else {
                // Update existing user (sync password)
                userId = existing[0].id;
                await pool.query('UPDATE users SET password = ?, role = ? WHERE id = ?', [hashedPassword, user.role, userId]);
                console.log(`  Updated existing user (ID: ${userId})`);
            }

            // Create Profile based on role
            if (user.role === 'teacher') {
                const [prof] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [userId]);
                if (prof.length === 0) {
                    await pool.query(
                        `INSERT INTO teachers (user_id, employee_id, first_name, last_name, date_of_birth, gender, phone, joining_date, status)
                         VALUES (?, ?, ?, ?, '1985-05-15', 'male', '9801234567', CURDATE(), 'active')`,
                        [userId, `TEA-${userId.toString().padStart(3, '0')}`, user.firstName, user.lastName]
                    );
                    console.log('  Created teacher profile.');
                }
            } else if (user.role === 'student') {
                const [prof] = await pool.query('SELECT id FROM students WHERE user_id = ?', [userId]);
                if (prof.length === 0) {
                    await pool.query(
                        `INSERT INTO students (user_id, admission_number, first_name, last_name, date_of_birth, gender, parent_phone, status, admission_date)
                         VALUES (?, ?, ?, ?, '2010-01-01', 'male', '9801112223', 'active', CURDATE())`,
                        [userId, `ADM-${userId.toString().padStart(3, '0')}`, user.firstName, user.lastName]
                    );
                    console.log('  Created student profile.');
                }
            } else if (['accountant', 'hr', 'guard'].includes(user.role)) {
                const [prof] = await pool.query('SELECT id FROM staff WHERE user_id = ?', [userId]);
                if (prof.length === 0) {
                    await pool.query(
                        `INSERT INTO staff (user_id, employee_id, first_name, last_name, designation, joining_date, status, date_of_birth, gender, phone)
                         VALUES (?, ?, ?, ?, ?, CURDATE(), 'active', '1990-01-01', 'male', '9800000000')`,
                        [userId, `STF-${userId.toString().padStart(3, '0')}`, user.firstName, user.lastName, user.role.toUpperCase()]
                    );
                    console.log(`  Created staff profile for ${user.role}.`);
                }
            }
        }

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDemoAccounts();
