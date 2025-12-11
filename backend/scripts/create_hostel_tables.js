const db = require('../config/database');

const createHostelTables = async () => {
    try {
        console.log('Creating hostel_rooms table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS hostel_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(50) NOT NULL,
        building_name VARCHAR(100) DEFAULT 'Main Hostel',
        type ENUM('male', 'female') NOT NULL,
        capacity INT DEFAULT 4,
        current_occupancy INT DEFAULT 0,
        status ENUM('active', 'maintenance') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_room (room_number, building_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('Creating hostel_allocations table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS hostel_allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        room_id INT NOT NULL,
        allocation_date DATE DEFAULT (CURRENT_DATE),
        status ENUM('active', 'vacated') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('Hostel tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
};

createHostelTables();


