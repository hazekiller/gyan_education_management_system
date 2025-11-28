const db = require('../config/database');

const createTransportTables = async () => {
    try {
        console.log('Creating transport_vehicles table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS transport_vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_number VARCHAR(50) NOT NULL,
        registration_number VARCHAR(50) NOT NULL,
        driver_name VARCHAR(100) NOT NULL,
        driver_phone VARCHAR(20) NOT NULL,
        sub_driver_name VARCHAR(100) DEFAULT NULL,
        sub_driver_phone VARCHAR(20) DEFAULT NULL,
        capacity INT DEFAULT 40,
        status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bus (bus_number),
        UNIQUE KEY unique_reg (registration_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('Creating transport_routes table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS transport_routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        route_name VARCHAR(100) NOT NULL,
        vehicle_id INT DEFAULT NULL,
        start_point VARCHAR(100) NOT NULL,
        end_point VARCHAR(100) NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES transport_vehicles(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('Creating transport_stops table...');
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

        console.log('Creating transport_allocations table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS transport_allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        route_id INT NOT NULL,
        pickup_stop_id INT DEFAULT NULL,
        drop_stop_id INT DEFAULT NULL,
        seat_number VARCHAR(20) DEFAULT NULL,
        allocation_date DATE DEFAULT (CURRENT_DATE),
        status ENUM('active', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE,
        FOREIGN KEY (pickup_stop_id) REFERENCES transport_stops(id) ON DELETE SET NULL,
        FOREIGN KEY (drop_stop_id) REFERENCES transport_stops(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('Transport tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createTransportTables();
