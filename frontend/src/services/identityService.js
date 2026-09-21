import api from './api';

export const identityService = {
  // Request OTP for Aadhar verification
  requestOtp: async (aadharNumber) => {
    try {
      const response = await api.post('/auth/aadhar/request-otp', {
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
      const response = await api.post('/auth/aadhar/verify-otp', {
        aadharNumber,
        otp
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Administrator provisioning is restricted to authenticated administrators.
};
