const pool = require('../config/database');

const createBlogsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                image_url VARCHAR(255),
                author_id INT,
                status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                views INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('Blogs table created successfully');
    } catch (error) {
        console.error('Error creating blogs table:', error);
    } finally {
        process.exit();
    }
};

createBlogsTable();
