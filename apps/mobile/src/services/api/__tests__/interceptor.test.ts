import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { setupInterceptors } from '../interceptors';

jest.mock('expo-secure-store');

describe('API Interceptors', () => {
  let mockAxios: any;

  beforeEach(() => {
    mockAxios = {
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };
    jest.clearAllMocks();
  });

  describe('setupInterceptors', () => {
    it('should setup request and response interceptors', () => {
      setupInterceptors(mockAxios);
      
      expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when access token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test_access_token');
      
      setupInterceptors(mockAxios);
      
      const requestInterceptor = mockAxios.interceptors.request.use.mock.calls[0][0];
      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;
      
      const result = await requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test_access_token');
    });

    it('should not add Authorization header when access token does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      
      setupInterceptors(mockAxios);
      
      const requestInterceptor = mockAxios.interceptors.request.use.mock.calls[0][0];
      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;
      
      const result = await requestInterceptor(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor - Token Refresh', () => {
    it('should retry request after refreshing token on 401 error', async () => {
      const mockRefreshResponse = {
        data: {
          session: {
            accessToken: 'new_access_token',
            refreshToken: 'new_refresh_token',
          },
        },
      };

      // First call returns old token, second call returns new token
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('old_access_token')
        .mockResolvedValueOnce('old_refresh_token')
        .mockResolvedValueOnce('new_access_token');

      // Mock axios.post for refresh
      jest.spyOn(axios, 'post').mockResolvedValueOnce(mockRefreshResponse);

      // Mock the retry request
      const mockRetryRequest = jest.fn().mockResolvedValue({ data: 'success' });
      mockAxios.request = mockRetryRequest;

      setupInterceptors(mockAxios);

      const responseErrorInterceptor = mockAxios.interceptors.response.use.mock.calls[0][1];

      const error: Partial<AxiosError> = {
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {
            headers: {} as any,
          } as InternalAxiosRequestConfig,
        },
        config: {
          headers: {} as any,
          url: '/v1/me',
          _retry: undefined,
        } as any,
      };

      await responseErrorInterceptor(error as AxiosError);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'new_access_token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'new_refresh_token');
      expect(mockRetryRequest).toHaveBeenCalled();
    });

    it('should not retry if _retry flag is set (prevent infinite loop)', async () => {
      setupInterceptors(mockAxios);

      const responseErrorInterceptor = mockAxios.interceptors.response.use.mock.calls[0][1];

      const error: Partial<AxiosError> = {
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {
            headers: {} as any,
          } as InternalAxiosRequestConfig,
        },
        config: {
          headers: {} as any,
          _retry: true,
        } as any,
      };

      await expect(responseErrorInterceptor(error as AxiosError)).rejects.toEqual(error);
    });

    it('should not retry for non-401 errors', async () => {
      setupInterceptors(mockAxios);

      const responseErrorInterceptor = mockAxios.interceptors.response.use.mock.calls[0][1];

      const error: Partial<AxiosError> = {
        response: {
          status: 400,
          data: {},
          statusText: 'Bad Request',
          headers: {},
          config: {
            headers: {} as any,
          } as InternalAxiosRequestConfig,
        },
        config: {
          headers: {} as any,
        } as any,
      };

      await expect(responseErrorInterceptor(error as AxiosError)).rejects.toEqual(error);
    });

    it('should handle refresh failure gracefully', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('old_refresh_token');

      // Mock refresh failure
      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Refresh failed'));

      setupInterceptors(mockAxios);

      const responseErrorInterceptor = mockAxios.interceptors.response.use.mock.calls[0][1];

      const error: Partial<AxiosError> = {
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: {
            headers: {} as any,
          } as InternalAxiosRequestConfig,
        },
        config: {
          headers: {} as any,
          _retry: undefined,
        } as any,
      };

      await expect(responseErrorInterceptor(error as AxiosError)).rejects.toEqual(error);
    });
  });
});
