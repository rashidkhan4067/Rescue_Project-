import api from '../api';

export const volunteerService = {
  getAll: async () => {
    const res = await api.get('/volunteers');
    return res.data;
  },
  register: async (volunteerData) => {
    const res = await api.post('/volunteers', volunteerData);
    return res.data;
  },
  mobilize: async (sector) => {
    const res = await api.post('/volunteers/mobilize', { sector });
    return res.data;
  },
  getRadarCoordinates: async () => {
    const res = await api.get('/radar/coordinates');
    return res.data;
  },
  update: async (id, volunteerData) => {
    const res = await api.put(`/volunteers/${id}`, volunteerData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/volunteers/${id}`);
    return res.data;
  }
};
