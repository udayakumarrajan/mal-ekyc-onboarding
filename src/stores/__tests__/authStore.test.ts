import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../authStore';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store');

// Mock API client
jest.mock('../../services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { apiClient } from '../../services/api/client';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
    
    // Clear mocks
    jest.clearAllMocks();
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('login', () => {
    it('should update status to logged_in on successful login', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 'USR-001',
            email: 'test@example.com',
            fullName: 'Test User',
          },
          session: {
            accessToken: 'access-token-123',
            refreshToken: 'refresh-token-123',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.status).toBe('logged_in');
      expect(result.current.user).toEqual(mockResponse.data.user);
      expect(result.current.session).toEqual(mockResponse.data.session);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'access_token',
        'access-token-123'
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token-123'
      );
    });

    it('should set error and stay logged_out on failed login', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
            },
          },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(result.current.status).toBe('logged_out');
      expect(result.current.error).toBe('Invalid email or password');
      expect(result.current.user).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.status).toBe('logged_out');
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('logout', () => {
    it('should clear tokens and user data', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      const mockResponse = {
        data: {
          user: {
            id: 'USR-001',
            email: 'test@example.com',
            fullName: 'Test User',
          },
          session: {
            accessToken: 'access-token-123',
            refreshToken: 'refresh-token-123',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.status).toBe('logged_in');

      // Now logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.status).toBe('logged_out');
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('refreshSession', () => {
    it('should refresh tokens successfully', async () => {
      const mockRefreshResponse = {
        data: {
          session: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          },
        },
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('old-refresh-token');
      (apiClient.post as jest.Mock).mockResolvedValue(mockRefreshResponse);

      const { result } = renderHook(() => useAuthStore());

      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshSession();
      });

      expect(refreshResult).toBe(true);
      expect(result.current.session?.accessToken).toBe('new-access-token');
    });

    it('should return false on refresh failure', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('old-refresh-token');
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Token invalid'));

      const { result } = renderHook(() => useAuthStore());

      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshSession();
      });

      expect(refreshResult).toBe(false);
    });
  });
});
