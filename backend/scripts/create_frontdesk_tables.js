const pool = require('../config/database');

async function createFrontDeskTables() {
    const connection = await pool.getConnection();
    try {
        console.log('Creating frontdesk tables...');

        // Create frontdesk table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS frontdesk (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                employee_id VARCHAR(50) NOT NULL UNIQUE,
                first_name VARCHAR(100) NOT NULL,
                middle_name VARCHAR(100),
                last_name VARCHAR(100) NOT NULL,
                date_of_birth DATE NOT NULL,
                gender ENUM('male', 'female', 'other') NOT NULL,
                blood_group VARCHAR(10),
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                phone VARCHAR(20) NOT NULL,
                emergency_contact VARCHAR(20),
                shift_timing VARCHAR(50),
                joining_date DATE NOT NULL,
                salary DECIMAL(10,2),
                status ENUM('active', 'inactive', 'resigned', 'retired') DEFAULT 'active',
                profile_photo VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ frontdesk table created');

        // Create frontdesk_visitors table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS frontdesk_visitors (
                id INT PRIMARY KEY AUTO_INCREMENT,
                staff_id INT NOT NULL,
                visitor_name VARCHAR(255) NOT NULL,
                visitor_phone VARCHAR(20),
                visitor_email VARCHAR(255),
                purpose ENUM('admission_inquiry', 'meeting', 'complaint', 'document_submission', 'other') DEFAULT 'other',
                person_to_meet VARCHAR(255),
                check_in_time DATETIME NOT NULL,
                check_out_time DATETIME,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ frontdesk_visitors table created');

        // Create frontdesk_inquiries table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS frontdesk_inquiries (
                id INT PRIMARY KEY AUTO_INCREMENT,
                staff_id INT NOT NULL,
                inquiry_type ENUM('admission', 'fees', 'general', 'complaint', 'other') DEFAULT 'general',
                inquirer_name VARCHAR(255) NOT NULL,
                inquirer_phone VARCHAR(20),
                inquirer_email VARCHAR(255),
                subject VARCHAR(255) NOT NULL,
                details TEXT,
                status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                assigned_to INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ frontdesk_inquiries table created');

        console.log('All frontdesk tables created successfully!');
    } catch (error) {
        console.error('Error creating frontdesk tables:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Run migration
createFrontDeskTables()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
