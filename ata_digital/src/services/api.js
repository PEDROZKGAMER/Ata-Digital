import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const classAPI = {
  create: (data) => api.post('/classes', data),
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  end: (id) => api.patch(`/classes/${id}/end`),
  delete: (id) => api.delete(`/classes/${id}`),
};

export const attendanceAPI = {
  register: (data) => api.post('/attendance', data),
  getByClass: (classId) => api.get(`/attendance/class/${classId}`),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  deleteAccount: () => api.delete('/user/account'),
};

export default api;