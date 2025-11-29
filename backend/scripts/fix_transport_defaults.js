const db = require('../config/database');

const fixTransportSchemaDefaults = async () => {
    try {
        console.log('Fixing transport_routes table defaults...');

        // Modify columns to allow NULL or set defaults for old columns that are causing issues
        await db.query(`
      ALTER TABLE transport_routes
      MODIFY COLUMN vehicle_number VARCHAR(50) DEFAULT NULL,
      MODIFY COLUMN driver_name VARCHAR(255) DEFAULT NULL,
      MODIFY COLUMN driver_phone VARCHAR(20) DEFAULT NULL
    `);

        console.log('Defaults fixed for transport_routes.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema defaults:', error);
        process.exit(1);
    }
};

fixTransportSchemaDefaults();
