import axios from 'axios';
import io from 'socket.io-client';

const API_BASE = '/api/chat';
const SOCKET_URL = 'http://localhost:8080';

let socket = null;

export const chatService = {
  // Initialize WebSocket connection
  initializeSocket: (userId) => {
    socket = io(SOCKET_URL, {
      auth: {
        userId
      }
    });
    return socket;
  },

  // Get or disconnect socket
  getSocket: () => socket,

  // Get chat messages for a report
  getMessages: async (reportId, page = 0) => {
    try {
      const response = await axios.get(`${API_BASE}/messages/${reportId}?page=${page}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Send message
  sendMessage: async (reportId, recipientId, content) => {
    try {
      const response = await axios.post(`${API_BASE}/messages`, {
        reportId,
        recipientId,
        content
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      const response = await axios.patch(`${API_BASE}/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_BASE}/unread-count`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark all messages read in a chat room
  markAllAsRead: async (reportId) => {
    try {
      const response = await axios.patch(`${API_BASE}/room/${reportId}/read-all`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
