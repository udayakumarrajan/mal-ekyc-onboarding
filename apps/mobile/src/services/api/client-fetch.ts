import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  _retry?: boolean;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<{ data: T; status: number }> {
    const { skipAuth, _retry, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    // Add auth token if not skipped
    if (!skipAuth) {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (accessToken) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }
    }

    // Set content type
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    try {
      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      // Handle token refresh on 401
      if (response.status === 401 && !_retry && !skipAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request
          return this.request(endpoint, { ...options, _retry: true });
        }
      }

      if (!response.ok) {
        throw { response: { data, status: response.status } };
      }

      return { data, status: response.status };
    } catch (error: any) {
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      await SecureStore.setItemAsync('access_token', data.session.accessToken);
      await SecureStore.setItemAsync('refresh_token', data.session.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async get<T = any>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new APIClient(API_URL);
