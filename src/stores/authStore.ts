import { create } from 'zustand';
import { apiClient } from '../services/api/client';
import { User, Session, AuthStatus } from '../types';
import { mockSecureStore } from '../utils/mockStorage';

// Use mock storage for simulator to avoid Hermes callback issues
const SecureStore = {
  setItemAsync: (key: string, value: string) => mockSecureStore.setItem(key, value),
  getItemAsync: (key: string) => mockSecureStore.getItem(key),
  deleteItemAsync: (key: string) => mockSecureStore.removeItem(key),
};

interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  loadSession: () => Promise<void>;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'logged_out',
  user: null,
  session: null,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ status: 'logging_in', error: null });

      const response = await apiClient.post('/v1/auth/login', {
        email,
        password,
      });

      const { user, session } = response.data;

      // Store tokens securely
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);

      set({
        status: 'logged_in',
        user,
        session,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message || 'Login failed';
      set({
        status: 'logged_out',
        error: errorMessage,
        user: null,
        session: null,
      });
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }

    set({
      status: 'logged_out',
      user: null,
      session: null,
      error: null,
    });
  },

  refreshSession: async () => {
    try {
      set({ status: 'refreshing' });

      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        set({ status: 'expired' });
        return false;
      }

      const response = await apiClient.post('/v1/auth/refresh', {
        refreshToken,
      });

      const { session } = response.data;

      // Update tokens
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);

      set({
        status: 'logged_in',
        session,
      });

      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      set({ status: 'expired' });
      return false;
    }
  },

  loadSession: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        // Try to get user info
        const response = await apiClient.get('/v1/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        set({
          status: 'logged_in',
          user: response.data.user,
          session: {
            accessToken,
            refreshToken,
            expiresAt: '', // We'll get this from the API if needed
          },
        });
      }
    } catch (error) {
      // Session expired or invalid, logout
      await get().logout();
    }
  },
}));
