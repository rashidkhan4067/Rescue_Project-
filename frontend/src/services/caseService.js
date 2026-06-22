import api from '../api';

export const caseService = {
  create: async (formData) => {
    const res = await api.post('/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
  search: async (query) => {
    const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
  getDetails: async (id) => {
    const res = await api.get(`/report/${id}`);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/report/${id}/status`, { status });
    return res.data;
  },
  updateDetails: async (id, data) => {
    const res = await api.put(`/report/${id}`, data);
    return res.data;
  },
  getAlerts: async () => {
    const res = await api.get('/alert');
    return res.data;
  }
};
