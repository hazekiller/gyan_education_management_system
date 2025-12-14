const pool = require('../config/database');

async function debugUsers() {
    try {
        console.log('Checking users and roles...');
        const [users] = await pool.query('SELECT id, email, role FROM users');
        console.table(users);
        process.exit(0);
    } catch (error) {
        console.error('Error querying users:', error);
        process.exit(1);
    }
}

debugUsers();
