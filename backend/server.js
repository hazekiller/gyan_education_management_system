const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const db = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', routes);

// Socket.IO connection handling
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User comes online
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId.toString(), socket.id);
    socket.userId = userId;
    
    // Broadcast to all users that this user is online
    io.emit('user_status_changed', { userId, isOnline: true });
    console.log(`👤 User ${userId} is online (${onlineUsers.size} users online)`);
  });

  // Join room based on user role/id
  socket.on('join', (data) => {
    socket.join(data.room);
    console.log(`Socket ${socket.id} joined room: ${data.room}`);
  });

  // Send message via Socket.IO
  socket.on('send_message', async (data) => {
    try {
      const { sender_id, receiver_id, content } = data;
      
      // Save to database
      const [result] = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [sender_id, receiver_id, content]
      );
      
      const [message] = await db.query(
        'SELECT * FROM messages WHERE id = ?',
        [result.insertId]
      );
      
      const messageData = message[0];
      
      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiver_id.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', {
          ...messageData,
          message_type: 'received'
        });
        console.log(`📨 Message sent to user ${receiver_id}`);
      }
      
      // Confirm to sender
      socket.emit('message_sent', {
        ...messageData,
        message_type: 'sent'
      });
      
      // Update conversations for both users
      io.to(receiverSocketId).emit('conversation_updated');
      socket.emit('conversation_updated');
      
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message_error', { error: error.message });
    }
  });

  // Mark message as read
  socket.on('mark_read', async (data) => {
    try {
      const { message_id, user_id } = data;
      
      await db.query(
        'UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
        [message_id, user_id]
      );
      
      // Notify sender
      const [message] = await db.query(
        'SELECT sender_id FROM messages WHERE id = ?',
        [message_id]
      );
      
      if (message[0]) {
        const senderSocketId = onlineUsers.get(message[0].sender_id.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read', { message_id });
        }
      }
    } catch (error) {
      console.error('Socket mark read error:', error);
    }
  });

  // User typing indicator
  socket.on('typing', (data) => {
    const { receiver_id, sender_id, isTyping } = data;
    const receiverSocketId = onlineUsers.get(receiver_id.toString());
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { sender_id, isTyping });
    }
  });

  // Handle private messages (legacy support)
  socket.on('private_message', (data) => {
    const recipientSocketId = onlineUsers.get(data.recipientId.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_message', {
        senderId: data.senderId,
        message: data.message,
        timestamp: new Date()
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId.toString());
      io.emit('user_status_changed', { userId: socket.userId, isOnline: false });
      console.log(`👤 User ${socket.userId} went offline (${onlineUsers.size} users online)`);
    }
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('✅ Database connected successfully');

    server.listen(PORT, () => {
      console.log(`
🚀 ============================================
   GYAN School Management System - Backend
   ============================================
   Environment: ${process.env.NODE_ENV || 'development'}
   Server running on port: ${PORT}
   API URL: http://localhost:${PORT}/api
   Health check: http://localhost:${PORT}/health
   Socket.io: ✅ Ready (${onlineUsers.size} users online)
   Database: ✅ Connected
============================================
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.end();
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };
