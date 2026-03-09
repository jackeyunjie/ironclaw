import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
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

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;

// 政策相关API
export const policyApi = {
  getList: (params?: any) => api.get('/policies', { params }),
  getById: (id: string) => api.get(`/policies/${id}`),
  getUpcoming: (days?: number) => api.get('/policies/upcoming', { params: { days } }),
  getClosing: (days?: number) => api.get('/policies/closing', { params: { days } }),
  matchPolicies: (enterpriseId: string, limit?: number) =>
    api.get('/policies/match', { params: { enterpriseId, limit } }),
};

// 企业相关API
export const enterpriseApi = {
  getList: (params?: any) => api.get('/enterprises', { params }),
  getById: (id: string) => api.get(`/enterprises/${id}`),
  getByUserId: (userId: string) => api.get(`/enterprises/user/${userId}`),
  create: (data: any) => api.post('/enterprises', data),
  update: (id: string, data: any) => api.put(`/enterprises/${id}`, data),
  delete: (id: string) => api.delete(`/enterprises/${id}`),
  trackPolicy: (id: string, policyId: string) =>
    api.post(`/enterprises/${id}/track-policy`, { policyId }),
  untrackPolicy: (id: string, policyId: string) =>
    api.post(`/enterprises/${id}/untrack-policy`, { policyId }),
  getStatistics: (id: string) => api.get(`/enterprises/${id}/statistics`),
};

// 认证相关API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
};