import api from './api';

export const announcementService = {
  // Get all active announcements
  getAnnouncements: async (scope = 'ALL', page = 0, targetId = null) => {
    try {
      const targetParam = scope === 'DISTRICT' ? 'targetDistrictId' : 'targetCategoryId';
      const targetQuery = targetId ? `&${targetParam}=${encodeURIComponent(targetId)}` : '';
      const response = await api.get(`/announcements?scope=${scope}&page=${page}${targetQuery}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get announcements for specific district
  getByDistrict: async (districtId, page = 0) => {
    try {
      return await announcementService.getAnnouncements('DISTRICT', page, districtId);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get announcements for specific category
  getByCategory: async (categoryId, page = 0) => {
    try {
      return await announcementService.getAnnouncements('CATEGORY', page, categoryId);
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

  deleteAnnouncement: async (announcementId) => {
    try {
      return await api.delete(`/announcements/${announcementId}`);
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
