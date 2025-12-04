const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Adjust path if run from scripts dir

const createBlogsTable = async () => {
    let connection;
    try {
        console.log('🔄 Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gyan_school_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');

        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS blogs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        status ENUM('published', 'draft') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_author (author_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

        await connection.query(createTableQuery);
        console.log('✅ Table "blogs" created or already exists');

    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        if (connection) await connection.end();
    }
};

createBlogsTable();
