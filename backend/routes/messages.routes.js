const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorization');
const {
  getAllUsers,
  getConversations,
  getMessagesByUser,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount
} = require('../controllers/messagesController');

// All routes require authentication
router.use(authenticate);

// Get all users for messaging - requires 'read' permission
router.get('/users', requirePermission('messages', 'read'), getAllUsers);

// Get conversations for current user - requires 'read' permission
router.get('/conversations', requirePermission('messages', 'read'), getConversations);

// Get unread message count - requires 'read' permission
router.get('/unread-count', requirePermission('messages', 'read'), getUnreadCount);

// Get messages with a specific user - requires 'read' permission
router.get('/:userId', requirePermission('messages', 'read'), getMessagesByUser);

// Send a message - requires 'create' permission
router.post('/', requirePermission('messages', 'create'), sendMessage);

// Mark message as read - requires 'update' permission
router.put('/:messageId/read', requirePermission('messages', 'update'), markMessageAsRead);

// Delete a message - requires 'delete' permission
router.delete('/:messageId', requirePermission('messages', 'delete'), deleteMessage);

module.exports = router;