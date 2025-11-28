const db = require('../config/database');

const fixTransportSchema = async () => {
    try {
        console.log('Fixing transport_routes table...');

        // Add missing columns to transport_routes
        await db.query(`
      ALTER TABLE transport_routes
      ADD COLUMN IF NOT EXISTS vehicle_id INT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS start_point VARCHAR(100) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS end_point VARCHAR(100) DEFAULT NULL,
      ADD CONSTRAINT fk_route_vehicle FOREIGN KEY (vehicle_id) REFERENCES transport_vehicles(id) ON DELETE SET NULL
    `);

        console.log('Columns added to transport_routes.');

        // Verify transport_stops exists (it should, but just in case)
        await db.query(`
      CREATE TABLE IF NOT EXISTS transport_stops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        route_id INT NOT NULL,
        stop_name VARCHAR(100) NOT NULL,
        pickup_time TIME DEFAULT NULL,
        drop_time TIME DEFAULT NULL,
        fare DECIMAL(10, 2) DEFAULT 0.00,
        sequence_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('Schema fix completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
};

fixTransportSchema();
