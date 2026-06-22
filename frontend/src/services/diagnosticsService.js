import api from '../api';

export const diagnosticsService = {
  runAiMatch: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await api.post('/ai-match', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/analytics/stats');
    return res.data;
  }
};
