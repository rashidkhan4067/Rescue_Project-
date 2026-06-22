import api from '../api';

export const authService = {
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (credentials) => {
    const res = await api.post('/auth/register', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  googleLogin: async (accessToken) => {
    const res = await api.post('/auth/google', { token: accessToken });
    return res.data;
  },
  requestMagicLink: async (email) => {
    const res = await api.post('/auth/magic-link/request', { email });
    return res.data;
  },
  verifyMagicLink: async (token) => {
    const res = await api.post('/auth/magic-link/verify', { token });
    return res.data;
  }
};
