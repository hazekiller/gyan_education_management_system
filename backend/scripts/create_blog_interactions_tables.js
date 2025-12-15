const pool = require('../config/database');

const createBlogInteractionsTables = async () => {
    try {
        // Create blog_likes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS blog_likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                blog_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_blog_like (blog_id, user_id)
            )
        `);
        console.log('blog_likes table created successfully');

        // Create blog_comments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS blog_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                blog_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('blog_comments table created successfully');

    } catch (error) {
        console.error('Error creating blog interactions tables:', error);
    } finally {
        process.exit();
    }
};

createBlogInteractionsTables();
