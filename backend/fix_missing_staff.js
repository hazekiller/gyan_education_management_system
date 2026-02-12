const pool = require('./config/database');

const fixMissingStaff = async () => {
    try {
        console.log('Checking for users with missing staff profiles...');

        // Get all users with roles that should have staff profiles
        const [users] = await pool.query(
            "SELECT * FROM users WHERE role IN ('accountant', 'hr', 'staff', 'founder')"
        );

        for (const user of users) {
            // Check if staff profile exists
            const [staff] = await pool.query('SELECT * FROM staff WHERE user_id = ?', [user.id]);

            if (staff.length === 0) {
                console.log(`Missing staff profile for user: ${user.email} (${user.role})`);

                let firstName = 'User';
                let lastName = user.role;
                if (user.role === 'accountant') { firstName = 'Main'; lastName = 'Accountant'; }
                if (user.role === 'hr') { firstName = 'Head'; lastName = 'HR'; }
                if (user.role === 'founder') { firstName = 'School'; lastName = 'Founder'; }
                if (user.role === 'staff') { firstName = 'General'; lastName = 'Staff'; }

                // Insert into staff table
                try {
                    await pool.query(
                        `INSERT INTO staff (user_id, employee_id, first_name, last_name, phone, designation, joining_date, status, date_of_birth, gender)
                         VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'active', '1990-01-01', 'male')`,
                        [
                            user.id,
                            `EMP${user.id.toString().padStart(3, '0')}`,
                            firstName,
                            lastName,
                            '9800000000',
                            user.role.toUpperCase(),
                        ]
                    );
                    console.log(`Created staff profile for ${user.email}`);
                } catch (err) {
                    console.error(`Failed to create profile for ${user.email}:`, err.message);
                }
            } else {
                console.log(`Staff profile exists for ${user.email}`);
            }
        }

        console.log('Fix completed.');
        process.exit(0);
    } catch (error) {
        console.error('Fix script failed:', error);
        process.exit(1);
    }
};

fixMissingStaff();
