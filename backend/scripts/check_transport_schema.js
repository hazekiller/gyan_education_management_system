const db = require('../config/database');

const checkTableStructure = async () => {
    try {
        console.log('Checking transport_routes structure...');
        const [columns] = await db.query("DESCRIBE transport_routes");
        console.log(columns);
        process.exit(0);
    } catch (error) {
        console.error('Error checking table:', error);
        process.exit(1);
    }
};

checkTableStructure();
