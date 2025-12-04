const db = require('../config/database');

// Get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const [blogs] = await db.query(`
      SELECT b.*, 
             COALESCE(t.first_name, s.first_name, st.first_name, 'Admin') as first_name,
             COALESCE(t.last_name, s.last_name, st.last_name, '') as last_name,
             u.role
      FROM blogs b 
      JOIN users u ON b.author_id = u.id 
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      ORDER BY b.created_at DESC
    `);

        res.json({
            success: true,
            data: blogs
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
};

// Get single blog
exports.getBlogById = async (req, res) => {
    try {
        const [blog] = await db.query(`
      SELECT b.*, 
             COALESCE(t.first_name, s.first_name, st.first_name, 'Admin') as first_name,
             COALESCE(t.last_name, s.last_name, st.last_name, '') as last_name,
             u.role
      FROM blogs b 
      JOIN users u ON b.author_id = u.id 
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE b.id = ?
    `, [req.params.id]);

        if (blog.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.json({
            success: true,
            data: blog[0]
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
};

// Create blog
exports.createBlog = async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const author_id = req.user.id; // Assuming auth middleware adds user to req

        const [result] = await db.query(
            'INSERT INTO blogs (title, content, author_id, status) VALUES (?, ?, ?, ?)',
            [title, content, author_id, status || 'published']
        );

        const [newBlog] = await db.query('SELECT * FROM blogs WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: newBlog[0]
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating blog',
            error: error.message
        });
    }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const blogId = req.params.id;

        const [result] = await db.query(
            'UPDATE blogs SET title = ?, content = ?, status = ? WHERE id = ?',
            [title, content, status, blogId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        const [updatedBlog] = await db.query('SELECT * FROM blogs WHERE id = ?', [blogId]);

        res.json({
            success: true,
            message: 'Blog updated successfully',
            data: updatedBlog[0]
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating blog',
            error: error.message
        });
    }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: error.message
        });
    }
};
