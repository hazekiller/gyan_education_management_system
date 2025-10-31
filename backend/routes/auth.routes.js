const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  login,
  getProfile,
  changePassword,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);

module.exports = router;