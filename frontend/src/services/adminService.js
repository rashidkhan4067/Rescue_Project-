import api from '../api';

export const adminService = {
  updateProfile: async (profileData) => {
    const res = await api.post('/profile', profileData);
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  toggleAdmin: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/toggle-admin`);
    return res.data;
  },
  createUser: async (userData) => {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },
  updateUser: async (userId, userData) => {
    const res = await api.put(`/admin/users/${userId}`, userData);
    return res.data;
  },
  deleteUser: async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },
  deleteCase: async (caseId) => {
    const res = await api.delete(`/admin/cases/${caseId}`);
    return res.data;
  },
  getSystemDiagnostics: async () => {
    const res = await api.get('/admin/system-diagnostics');
    return res.data;
  }
};

