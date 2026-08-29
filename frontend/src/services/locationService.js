import axios from 'axios';

const API_BASE = '/api/location';

export const locationService = {
  // Get all states
  getStates: async () => {
    try {
      const response = await axios.get(`${API_BASE}/states`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get districts by state ID
  getDistrictsByState: async (stateId) => {
    try {
      const response = await axios.get(`${API_BASE}/states/${stateId}/districts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get areas by district ID
  getAreasByDistrict: async (districtId) => {
    try {
      const response = await axios.get(`${API_BASE}/districts/${districtId}/areas`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (lat, lng) => {
    try {
      const response = await axios.post(`${API_BASE}/reverse-geocode`, {
        latitude: lat,
        longitude: lng
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Geocode address to coordinates
  geocode: async (address) => {
    try {
      const response = await axios.post(`${API_BASE}/geocode`, { address });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user location
  getCurrentLocation: async () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => reject(error)
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }
};
