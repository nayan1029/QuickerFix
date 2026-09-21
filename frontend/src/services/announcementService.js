import api from './api';

export const announcementService = {
  // Get all active announcements
  getAnnouncements: async (scope = 'ALL', page = 0) => {
    try {
      const response = await api.get(`/announcements?scope=${scope}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get announcements for specific district
  getByDistrict: async (districtId, page = 0) => {
    try {
      return announcementService.getAnnouncements('DISTRICT', page);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get announcements for specific category
  getByCategory: async (categoryId, page = 0) => {
    try {
      return announcementService.getAnnouncements('CATEGORY', page);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get high-priority announcements
  getHighPriority: async () => {
    try {
      const response = await api.get('/announcements/high-priority');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create announcement (admin only)
  createAnnouncement: async (announcementData) => {
    try {
      const response = await api.post('/announcements', announcementData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark announcement as read
  markAsRead: async (announcementId) => {
    try {
      const response = await api.patch(`/announcements/${announcementId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/announcements/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
