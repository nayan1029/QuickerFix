import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('qf_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Reports
export const createReport = (formData) => api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAllReports = (page = 0, size = 10) => api.get(`/reports?page=${page}&size=${size}`);
export const getReportById = (id) => api.get(`/reports/${id}`);
export const getMyReports = () => api.get('/reports/my');
export const getNearbyReports = (lat, lng, radius) => api.get(`/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
export const upvoteReport = (id) => api.post(`/reports/${id}/upvote`);
export const updateStatus = (id, data) => api.put(`/reports/${id}/status`, data);
export const confirmResolution = (id) => api.post(`/reports/${id}/confirm`);
export const rejectResolution = (id, data) => api.post(`/reports/${id}/reject`, data);
export const addComment = (id, data) => api.post(`/reports/${id}/comments`, data);
export const getComments = (id) => api.get(`/reports/${id}/comments`);
export const rateReport = (id, data) => api.post(`/reports/${id}/rate`, data);

// Admin
export const getDashboard = () => api.get('/admin/dashboard');
export const getPriorityQueue = () => api.get('/admin/reports/priority');
export const assignWorker = (reportId, data) => api.post(`/admin/reports/${reportId}/assign`, data);
export const getAllUsers = () => api.get('/admin/users');
export const toggleUser = (userId) => api.patch(`/admin/users/${userId}/toggle`);
export const getAdminReports = (status) => api.get(`/admin/reports${status ? '?status=' + status : ''}`);
export const deleteReport = (id) => api.delete(`/admin/reports/${id}`);
export const createCategory = (data) => api.post('/admin/categories', data);
export const createDepartment = (data) => api.post('/admin/departments', data);

// Worker
export const getMyAssignments = () => api.get('/worker/assignments');
export const acceptAssignment = (id) => api.put(`/worker/assignments/${id}/accept`);
export const rejectAssignment = (id, data) => api.put(`/worker/assignments/${id}/reject`, data);
export const resolveReport = (reportId, formData) => api.post(`/worker/reports/${reportId}/resolve`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getWorkerStats = () => api.get('/worker/stats');

// Notifications
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put('/notifications/read-all');

// Categories & Departments
export const getCategories = () => api.get('/categories');
export const getDepartments = () => api.get('/departments');
