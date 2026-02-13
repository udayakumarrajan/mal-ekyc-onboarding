import { create } from 'zustand';
import { apiClient } from '../services/api/client';
import { OnboardingDraft, SubmissionState } from '../types';
import { mockAsyncStorage, mockSecureStore } from '../utils/mockStorage';

// Use mock storage for simulator to avoid Hermes callback issues
const AsyncStorage = mockAsyncStorage;
const SecureStore = {
  getItemAsync: (key: string) => mockSecureStore.getItem(key),
};

interface OnboardingState {
  draft: OnboardingDraft;
  currentStep: number;
  submissionState: SubmissionState;
  error: string | null;
  updateProfile: (profile: Partial<OnboardingDraft['profile']>) => void;
  updateDocument: (document: Partial<OnboardingDraft['document']>) => void;
  updateAddress: (address: Partial<OnboardingDraft['address']>) => void;
  updateConsents: (consents: Partial<OnboardingDraft['consents']>) => void;
  setCurrentStep: (step: number) => void;
  submitOnboarding: () => Promise<void>;
  clearDraft: () => Promise<void>;
  loadPersistedDraft: () => Promise<void>;
}

const DRAFT_STORAGE_KEY = '@ekyc_onboarding_draft';

const initialDraft: OnboardingDraft = {
  profile: {
    fullName: '',
    dateOfBirth: '',
    nationality: '',
  },
  document: {
    documentType: '',
    documentNumber: '',
  },
  address: {
    addressLine1: '',
    city: '',
    country: '',
  },
  consents: {
    termsAccepted: false,
  },
};

// Debounce helper
let saveTimeout: NodeJS.Timeout;
const debouncedSave = async (data: any) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, 500);
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  draft: initialDraft,
  currentStep: 0,
  submissionState: 'idle',
  error: null,

  updateProfile: (profile) => {
    const newDraft = {
      ...get().draft,
      profile: {
        ...get().draft.profile,
        ...profile,
      },
    };
    set({ draft: newDraft });
    debouncedSave({ draft: newDraft, currentStep: get().currentStep });
  },

  updateDocument: (document) => {
    const newDraft = {
      ...get().draft,
      document: {
        ...get().draft.document,
        ...document,
      },
    };
    set({ draft: newDraft });
    debouncedSave({ draft: newDraft, currentStep: get().currentStep });
  },

  updateAddress: (address) => {
    const newDraft = {
      ...get().draft,
      address: {
        ...get().draft.address,
        ...address,
      },
    };
    set({ draft: newDraft });
    debouncedSave({ draft: newDraft, currentStep: get().currentStep });
  },

  updateConsents: (consents) => {
    const newDraft = {
      ...get().draft,
      consents: {
        ...get().draft.consents,
        ...consents,
      },
    };
    set({ draft: newDraft });
    debouncedSave({ draft: newDraft, currentStep: get().currentStep });
  },

  setCurrentStep: (step) => {
    // Clamp step between 0 and 4
    const clampedStep = Math.max(0, Math.min(4, step));
    set({ currentStep: clampedStep });
    debouncedSave({ draft: get().draft, currentStep: clampedStep });
  },

  submitOnboarding: async () => {
    try {
      set({ submissionState: 'submitting', error: null });

      const accessToken = await SecureStore.getItemAsync('access_token');

      await apiClient.post(
        '/v1/onboarding/submit',
        {
          draft: get().draft,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Clear draft after successful submission
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      set({
        draft: initialDraft,
        currentStep: 0,
        submissionState: 'success',
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message || 'Submission failed';
      set({
        submissionState: 'error',
        error: errorMessage,
      });
    }
  },

  clearDraft: async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      set({
        draft: initialDraft,
        currentStep: 0,
        submissionState: 'idle',
        error: null,
      });
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  },

  loadPersistedDraft: async () => {
    try {
      const saved = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const { draft, currentStep } = JSON.parse(saved);
        set({
          draft: draft || initialDraft,
          currentStep: currentStep || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  },
}));
