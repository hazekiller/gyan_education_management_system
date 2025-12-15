const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Protected routes
router.post('/',
    authenticate,
    authorize('admin', 'teacher', 'super_admin'),
    blogController.upload.single('image'),
    blogController.createBlog
);

router.put('/:id',
    authenticate,
    authorize('admin', 'teacher', 'super_admin'),
    blogController.upload.single('image'),
    blogController.updateBlog
);

router.delete('/:id',
    authenticate,
    authorize('admin', 'teacher', 'super_admin'),
    blogController.deleteBlog
);

module.exports = router;
