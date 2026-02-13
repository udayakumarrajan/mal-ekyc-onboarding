import { create } from 'zustand';
import { apiClient } from '../services/api/client';
import { VerificationStatusResponse } from '../types';
import * as SecureStore from 'expo-secure-store';

interface VerificationState {
  status: VerificationStatusResponse | null;
  loading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  clearStatus: () => void;
}

export const useVerificationStore = create<VerificationState>((set) => ({
  status: null,
  loading: false,
  error: null,

  fetchStatus: async () => {
    try {
      set({ loading: true, error: null });

      const accessToken = await SecureStore.getItemAsync('access_token');

      const response = await apiClient.get('/v1/verification/status', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      set({
        status: response.data,
        loading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message || 'Failed to fetch status';
      set({
        loading: false,
        error: errorMessage,
      });
    }
  },

  clearStatus: () => {
    set({
      status: null,
      loading: false,
      error: null,
    });
  },
}));
