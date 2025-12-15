const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuthenticate, blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.get('/:id/comments', blogController.getBlogComments);

// Protected routes (Any authenticated user)
router.post('/:id/like', authenticate, blogController.toggleLike);
router.get('/:id/like-status', authenticate, blogController.getLikeStatus);
router.post('/:id/comments', authenticate, blogController.addBlogComment);
router.delete('/:id/comments/:commentId', authenticate, blogController.deleteBlogComment);

// Content Management (Teacher/Admin)
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
    authorize('admin', 'super_admin'),
    blogController.deleteBlog
);

module.exports = router;
