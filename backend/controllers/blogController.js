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
        const userId = req.user ? req.user.id : null;

        let query = `
            SELECT b.*, 
                   COALESCE(t.first_name, s.first_name, st.first_name, 'Admin') as first_name,
                   COALESCE(t.last_name, s.last_name, st.last_name, '') as last_name,
                   u.role,
                   (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as like_count,
                   (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count,
                   ${userId ? `(SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id AND user_id = ?) > 0 as is_liked` : 'FALSE as is_liked'}
            FROM blogs b 
            LEFT JOIN users u ON b.author_id = u.id 
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN staff st ON u.id = st.user_id
            WHERE 1=1
        `;
        const params = [];

        if (userId) {
            params.push(userId);
        }

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
                   u.role,
                   (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as like_count,
                   (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count
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

// Toggle like
exports.toggleLike = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.id;

        // Check if verify blog exists
        const [blog] = await pool.query('SELECT id FROM blogs WHERE id = ?', [blogId]);
        if (blog.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check if already liked
        const [existingLike] = await pool.query(
            'SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?',
            [blogId, userId]
        );

        let isLiked = false;
        if (existingLike.length > 0) {
            // Unlike
            await pool.query(
                'DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?',
                [blogId, userId]
            );
        } else {
            // Like
            await pool.query(
                'INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)',
                [blogId, userId]
            );
            isLiked = true;
        }

        // Get updated count
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = ?',
            [blogId]
        );

        res.json({
            success: true,
            isLiked,
            count: countResult[0].count
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing like',
            error: error.message
        });
    }
};

// Get blog comments
exports.getBlogComments = async (req, res) => {
    try {
        const blogId = req.params.id;
        const query = `
            SELECT c.*, 
                   COALESCE(t.first_name, s.first_name, st.first_name, 'Admin') as first_name,
                   COALESCE(t.last_name, s.last_name, st.last_name, '') as last_name,
                   u.role as author_role
            FROM blog_comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN staff st ON u.id = st.user_id
            WHERE c.blog_id = ?
            ORDER BY c.created_at DESC
        `;

        const [comments] = await pool.query(query, [blogId]);

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

// Add comment
exports.addBlogComment = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO blog_comments (blog_id, user_id, content) VALUES (?, ?, ?)',
            [blogId, userId, content]
        );

        const [newComment] = await pool.query(`
            SELECT c.*, 
                   COALESCE(t.first_name, s.first_name, st.first_name, 'Admin') as first_name,
                   COALESCE(t.last_name, s.last_name, st.last_name, '') as last_name,
                   u.role as author_role
            FROM blog_comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN staff st ON u.id = st.user_id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            data: newComment[0]
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

// Delete comment
exports.deleteBlogComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check comment ownership or admin privileges
        const [comment] = await pool.query('SELECT * FROM blog_comments WHERE id = ?', [commentId]);

        if (comment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (comment[0].user_id !== userId && !['admin', 'super_admin'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await pool.query('DELETE FROM blog_comments WHERE id = ?', [commentId]);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

// Check like status
exports.getLikeStatus = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user.id;

        const [existingLike] = await pool.query(
            'SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?',
            [blogId, userId]
        );

        res.json({
            success: true,
            isLiked: existingLike.length > 0
        });

    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking like status',
            error: error.message
        });
    }
};

module.exports.upload = upload;
