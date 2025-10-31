import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      if (userId) {
        this.socket.emit('user_online', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      if (userId) {
        this.socket.emit('user_online', userId);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected and cleaned up');
    }
  }

  // User comes online
  userOnline(userId) {
    if (this.socket?.connected) {
      this.socket.emit('user_online', userId);
    }
  }

  // Send message
  sendMessage(data) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data);
    }
  }

  // Mark message as read
  markAsRead(messageId, userId) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { message_id: messageId, user_id: userId });
    }
  }

  // Typing indicator
  typing(receiverId, senderId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { receiver_id: receiverId, sender_id: senderId, isTyping });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
      this.listeners.set('new_message', callback);
    }
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
      this.listeners.set('message_sent', callback);
    }
  }

  // Listen for message read confirmation
  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message_read', callback);
      this.listeners.set('message_read', callback);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  // Listen for user status changes
  onUserStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('user_status_changed', callback);
      this.listeners.set('user_status_changed', callback);
    }
  }

  // Listen for conversation updates
  onConversationUpdated(callback) {
    if (this.socket) {
      this.socket.on('conversation_updated', callback);
      this.listeners.set('conversation_updated', callback);
    }
  }

  // Listen for message errors
  onMessageError(callback) {
    if (this.socket) {
      this.socket.on('message_error', callback);
      this.listeners.set('message_error', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Remove specific listener
  removeListener(event) {
    if (this.socket && this.listeners.has(event)) {
      const callback = this.listeners.get(event);
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
