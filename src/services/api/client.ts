import Constants from 'expo-constants';
import { mockSecureStore } from '../../utils/mockStorage';

// Use mock storage for simulator to avoid Hermes callback issues
const SecureStore = mockSecureStore;

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// Axios-compatible interface using fetch
interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface RequestConfig {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  _retry?: boolean;
}

class FetchClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    url: string,
    options: RequestInit & RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const { skipAuth, _retry, headers: customHeaders, ...fetchOptions } = options;
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // Add auth token
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (!skipAuth) {
      const accessToken = await SecureStore.getItem('access_token');
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(fullURL, {
        ...fetchOptions,
        headers,
      });

      const data = await response.json().catch(() => null);

      // Handle 401 with token refresh
      if (response.status === 401 && !_retry && !skipAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.request(url, { ...options, _retry: true });
        }
      }

      if (!response.ok) {
        const error: any = new Error('Request failed');
        error.response = { data, status: response.status, statusText: response.statusText };
        throw error;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error: any) {
      if (error.response) throw error;
      throw { response: { data: { error: { message: error.message } }, status: 500 } };
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      await SecureStore.setItem('access_token', data.session.accessToken);
      await SecureStore.setItem('refresh_token', data.session.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async get<T = any>(url: string, config?: RequestConfig) {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig) {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new FetchClient(API_URL);
