import api from './api';

export const chatService = {
  // Initialize WebSocket connection
  initializeSocket: () => null,

  // Get or disconnect socket
  getSocket: () => null,

  // Get chat messages for a report
  getMessages: async (reportId, page = 0) => {
    try {
      const response = await api.get(`/chat/messages/${reportId}?page=${page}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Send message
  sendMessage: async (reportId, recipientId, content) => {
    try {
      const response = await api.post('/chat/messages', {
        reportId,
        recipientId,
        content
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      const response = await api.patch(`/chat/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark all messages read in a chat room
  markAllAsRead: async (reportId) => {
    try {
      const response = await api.patch(`/chat/room/${reportId}/read-all`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
