import axios from 'axios';

const api = axios.create({
  // Point this to your Flask backend URL
  baseURL: 'http://localhost:5000',
  // Critical for sending session cookies back and forth with Flask-Login
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure Global Interceptors
api.interceptors.response.use(
  (response) => {
    // Unwraps standardized envelope dynamically to keep component codebase clean, thin, and fully compatible
    if (response.data && response.data.success === true && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Check if unauthorized (401)
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Logging out...');
      
      // Lazily import the store to avoid circular dependency
      import('../store/useAuthStore').then((storeModule) => {
        const useAuthStore = storeModule.useAuthStore;
        // Dynamically update the state to log the user out on the frontend
        if (useAuthStore && useAuthStore.getState().isAuthenticated) {
          useAuthStore.setState({ 
            user: null, 
            isAuthenticated: false,
            error: 'Session expired. Please log in again.' 
          });
        }
      });
    }
    return Promise.reject(error);
  }
);

export default api;
