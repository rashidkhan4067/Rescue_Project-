import api from '../api';

export const aiService = {
  bulletinCopy: async (payload) => {
    const res = await api.post('/utils/ai-assistant/bulletin-copy', payload);
    return res.data;
  },
  chat: async (message) => {
    const res = await api.post('/utils/ai-assistant/chat', { message });
    return res.data;
  },
  extractProfile: async (text) => {
    const res = await api.post('/utils/ai-assistant/extract-profile', { text });
    return res.data;
  },
  analyzeImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await api.post('/utils/ai-assistant/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getWeatherConditions: async (lat, lng) => {
    const res = await api.get('/utils/ai-assistant/weather-conditions', {
      params: { lat, lng }
    });
    return res.data;
  }
};
