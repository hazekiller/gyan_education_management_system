import api from './api';

export const messagesAPI = {
  // Get all users available for messaging
  getUsers: (search = '') => api.get('/messages/users', { params: { search } }),
  
  // Get all conversations
  getConversations: () => api.get('/messages/conversations'),
  
  // Get messages with specific user
  getMessages: (userId) => api.get(`/messages/messages/${userId}`),
  
  // Send a message
  sendMessage: (data) => api.post('/messages/messages', data),
  
  // Mark message as read
  markAsRead: (messageId) => api.put(`/messages/messages/${messageId}/read`),
  
  // Delete a message
  deleteMessage: (messageId) => api.delete(`/messages/messages/${messageId}`),
};

export default messagesAPI;
