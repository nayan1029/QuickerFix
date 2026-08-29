import axios from 'axios';

const API_BASE = '/api/announcements';

export const announcementService = {
  // Get all active announcements
  getAnnouncements: async (scope = 'ALL', page = 0) => {
    try {
      const response = await axios.get(`${API_BASE}?scope=${scope}&page=${page}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get announcements for specific district
  getByDistrict: async (districtId, page = 0) => {
    try {
      const response = await axios.get(`${API_BASE}/district/${districtId}?page=${page}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get announcements for specific category
  getByCategory: async (categoryId, page = 0) => {
    try {
      const response = await axios.get(`${API_BASE}/category/${categoryId}?page=${page}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get high-priority announcements
  getHighPriority: async () => {
    try {
      const response = await axios.get(`${API_BASE}/high-priority`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create announcement (admin only)
  createAnnouncement: async (announcementData) => {
    try {
      const response = await axios.post(`${API_BASE}`, announcementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark announcement as read
  markAsRead: async (announcementId) => {
    try {
      const response = await axios.patch(`${API_BASE}/${announcementId}/read`);
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
  }
};
