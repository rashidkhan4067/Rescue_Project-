import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

/**
 * 🔐 Auth Command Hub (Zustand Protocol)
 * Orchestrates session state based on the clean decoupled architecture.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      error: null,

      // 💉 Session Lifecycle Handlers
      checkAuth: async () => {
        set({ loading: true });
        try {
          const data = await authService.getMe();
          set({ user: data.user, isAuthenticated: true, loading: false });
        } catch (err) {
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.login(credentials);
          set({ user: data.user, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (err) {
          const errMsg = err.response?.data?.error || 'Identity Handshake Aborted';
          set({ error: errMsg, loading: false });
          return { success: false, error: errMsg };
        }
      },

      register: async (credentials) => {
        set({ loading: true, error: null });
        try {
          await authService.register(credentials);
          set({ loading: false });
          return { success: true };
        } catch (err) {
          const errMsg = err.response?.data?.error || 'Registration failed';
          set({ error: errMsg, loading: false });
          return { success: false, error: errMsg };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (err) {
          console.error("Logout request failed, clearing local state anyway.");
        }
        set({ user: null, isAuthenticated: false, error: null });
      },

      googleLogin: async (accessToken) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.googleLogin(accessToken);
          set({ user: data.user, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (err) {
          const errMsg = err.response?.data?.error || 'Google login failed';
          set({ error: errMsg, loading: false });
          return { success: false, error: errMsg };
        }
      },

      requestMagicLink: async (email) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.requestMagicLink(email);
          set({ loading: false });
          return { success: true, token: data.demo_token }; // demo_token is returned for demo purposes
        } catch (err) {
          const errMsg = err.response?.data?.error || 'Failed to request magic link';
          set({ error: errMsg, loading: false });
          return { success: false, error: errMsg };
        }
      },

      verifyMagicLink: async (token) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.verifyMagicLink(token);
          set({ user: data.user, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (err) {
          const errMsg = err.response?.data?.error || 'Magic link verification failed';
          set({ error: errMsg, loading: false });
          return { success: false, error: errMsg };
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ loading })
    }),
    {
      name: 'rescue-auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-verify the session cookie with the backend silently
          state.checkAuth();
        }
      },
      partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
