const pool = require('../config/database');

async function debugClasses() {
    try {
        console.log('Checking classes in database...');
        const [classes] = await pool.query('SELECT * FROM classes');
        console.log(`Found ${classes.length} classes.`);
        if (classes.length > 0) {
            console.log('First class:', classes[0]);
        } else {
            console.log('No classes found in DB.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error querying classes:', error);
        process.exit(1);
    }
}

debugClasses();
