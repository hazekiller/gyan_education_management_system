const express = require('express');
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const blogController = require('../controllers/blogController');

// All routes require authentication
router.use(authenticate);

// Public routes (or protected for all authenticated users)
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Admin routes
router.post('/', blogController.createBlog);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
