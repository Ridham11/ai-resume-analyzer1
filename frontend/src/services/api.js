import axios from 'axios';

// Base URL for your backend
const API_BASE_URL = 'https://ai-resume-analyzer1-3.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// ==================== RESUME APIs ====================
export const resumeAPI = {
  upload: (formData) => 
    api.post('/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyResumes: () => api.get('/api/resume/my-resumes'),
  getById: (id) => api.get(`/api/resume/${id}`),
  delete: (id) => api.delete(`/api/resume/${id}`),
};

// ==================== ANALYSIS APIs ====================
export const analysisAPI = {
  atsCheck: (data) => api.post('/api/analysis/ats-check', data),
  getHistory: (resumeId) => api.get(`/api/analysis/history/${resumeId}`),
  reAnalyze: (resumeId) => api.post(`/api/analysis/re-analyze/${resumeId}`),
};

export default api;
