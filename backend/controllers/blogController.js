const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = 'uploads/blogs';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = `
            SELECT b.*, 
                   COALESCE(t.first_name, s.first_name, st.first_name, 'Admin') as first_name,
                   COALESCE(t.last_name, s.last_name, st.last_name, '') as last_name,
                   u.role
            FROM blogs b 
            LEFT JOIN users u ON b.author_id = u.id 
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN staff st ON u.id = st.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (b.title LIKE ? OR b.content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY b.created_at DESC';

        const [blogs] = await pool.query(query, params);

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

// Get blog by ID
exports.getBlogById = async (req, res) => {
    try {
        const [blog] = await pool.query(`
            SELECT b.*, 
                   COALESCE(t.first_name, s.first_name, st.first_name, 'Admin') as first_name,
                   COALESCE(t.last_name, s.last_name, st.last_name, '') as last_name,
                   u.role
            FROM blogs b 
            LEFT JOIN users u ON b.author_id = u.id 
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

        // Increment views
        await pool.query('UPDATE blogs SET views = views + 1 WHERE id = ?', [req.params.id]);

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
        const author_id = req.user.id;
        const image_url = req.file ? `/uploads/blogs/${req.file.filename}` : null;

        const [result] = await pool.query(
            'INSERT INTO blogs (title, content, image_url, author_id, status) VALUES (?, ?, ?, ?, ?)',
            [title, content, image_url, author_id, status || 'draft']
        );

        const [newBlog] = await pool.query('SELECT * FROM blogs WHERE id = ?', [result.insertId]);

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
        const image_url = req.file ? `/uploads/blogs/${req.file.filename}` : null;

        let query = 'UPDATE blogs SET title = ?, content = ?, status = ?';
        let params = [title, content, status];

        if (image_url) {
            query += ', image_url = ?';
            params.push(image_url);
        }

        query += ' WHERE id = ?';
        params.push(blogId);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        const [updatedBlog] = await pool.query('SELECT * FROM blogs WHERE id = ?', [blogId]);

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
        const [blog] = await pool.query('SELECT image_url FROM blogs WHERE id = ?', [req.params.id]);

        if (blog.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        await pool.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);

        // Delete image file if exists
        if (blog[0].image_url) {
            const filePath = path.join(__dirname, '..', blog[0].image_url);
            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
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

module.exports.upload = upload;
