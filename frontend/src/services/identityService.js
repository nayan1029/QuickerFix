import axios from 'axios';

const API_BASE = '/api/auth';

export const identityService = {
  // Request OTP for Aadhar verification
  requestOtp: async (aadharNumber) => {
    try {
      const response = await axios.post(`${API_BASE}/aadhar/request-otp`, {
        aadharNumber
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify OTP
  verifyOtp: async (aadharNumber, otp) => {
    try {
      const response = await axios.post(`${API_BASE}/aadhar/verify-otp`, {
        aadharNumber,
        otp
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register admin
  registerAdmin: async (adminData) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/register`, adminData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get admin verification status
  getAdminStatus: async (adminId) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/${adminId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
