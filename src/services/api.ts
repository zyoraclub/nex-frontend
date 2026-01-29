import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { organization_name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  resendOTP: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  verify2FALogin: (data: { email: string; code: string; temp_token: string }) =>
    api.post('/auth/login/2fa-verify', data),

  resend2FACode: (data: { email: string; temp_token: string }) =>
    api.post('/auth/login/resend-2fa', data),

  getMe: () => api.get('/auth/me'),

  // OAuth
  getOAuthUrl: (provider: 'github' | 'google') =>
    api.get(`/auth/oauth/${provider}`),

  oauthCallback: (provider: string, code: string) =>
    api.post(`/auth/oauth/${provider}/callback`, null, { params: { code } }),

  completeOAuthRegistration: (data: {
    organization_name: string;
    email: string;
    name?: string;
    avatar_url?: string;
    provider?: string;
    provider_id?: string;
  }) => api.post('/auth/oauth/complete', null, { params: data }),
};

export default api;
