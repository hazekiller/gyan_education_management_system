const pool = require('../config/database');

async function debugUsers() {
    try {
        console.log('--- Debugging Users ---');
        const [users] = await pool.query("SELECT id, email, role FROM users");
        console.log('Users found:', users);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

debugUsers();
