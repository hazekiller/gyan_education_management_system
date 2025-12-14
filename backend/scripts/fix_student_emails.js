const db = require('../config/database');

async function fixStudentEmails() {
    try {
        console.log('Starting email fix...');

        // Get all users with student role that have emails containing 'app-'
        const [users] = await db.query(`
      SELECT u.id, u.email, s.first_name, s.last_name
      FROM users u
      JOIN students s ON u.id = s.user_id
      WHERE u.role = 'student' AND u.email LIKE '%app-%'
    `);

        console.log(`Found ${users.length} students with incorrect email format`);

        for (const user of users) {
            // Generate new email in correct format
            const newEmail = `${user.first_name.toLowerCase()}.${user.last_name.toLowerCase()}@gyan.edu`;

            console.log(`Updating: ${user.email} -> ${newEmail}`);

            // Update the email
            await db.query(
                'UPDATE users SET email = ? WHERE id = ?',
                [newEmail, user.id]
            );
        }

        console.log('Email fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing emails:', error);
        process.exit(1);
    }
}

fixStudentEmails();
