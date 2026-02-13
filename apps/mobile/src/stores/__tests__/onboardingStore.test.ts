import { renderHook, act } from '@testing-library/react-native';
import { useOnboardingStore } from '../onboardingStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock API client
jest.mock('../../services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { apiClient } from '../../services/api/client';

describe('Onboarding Store', () => {
  beforeEach(() => {
    // Reset store
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.clearDraft();
    });
    
    // Clear mocks
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('updateProfile', () => {
    it('should update profile data', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.updateProfile({
          fullName: 'John Doe',
          dateOfBirth: '1990-05-15',
          nationality: 'US',
        });
      });

      expect(result.current.draft.profile.fullName).toBe('John Doe');
      expect(result.current.draft.profile.dateOfBirth).toBe('1990-05-15');
      expect(result.current.draft.profile.nationality).toBe('US');
    });

    it('should persist draft to AsyncStorage', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        result.current.updateProfile({
          fullName: 'John Doe',
          dateOfBirth: '1990-05-15',
          nationality: 'US',
        });
        
        // Wait for debounce (500ms + buffer)
        await new Promise((resolve) => setTimeout(resolve, 600));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('updateDocument', () => {
    it('should update document data', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.updateDocument({
          documentType: 'PASSPORT',
          documentNumber: 'P12345678',
        });
      });

      expect(result.current.draft.document.documentType).toBe('PASSPORT');
      expect(result.current.draft.document.documentNumber).toBe('P12345678');
    });
  });

  describe('updateAddress', () => {
    it('should update address data', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.updateAddress({
          addressLine1: '123 Main St',
          city: 'Springfield',
          country: 'US',
        });
      });

      expect(result.current.draft.address.addressLine1).toBe('123 Main St');
      expect(result.current.draft.address.city).toBe('Springfield');
      expect(result.current.draft.address.country).toBe('US');
    });
  });

  describe('updateConsents', () => {
    it('should update consents data', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.updateConsents({
          termsAccepted: true,
        });
      });

      expect(result.current.draft.consents.termsAccepted).toBe(true);
    });
  });

  describe('setCurrentStep', () => {
    it('should update current step', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.setCurrentStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should not allow invalid step numbers', () => {
      const { result } = renderHook(() => useOnboardingStore());

      act(() => {
        result.current.setCurrentStep(-1);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.setCurrentStep(10);
      });

      expect(result.current.currentStep).toBe(4); // Max step is 4
    });
  });

  describe('submitOnboarding', () => {
    it('should submit onboarding successfully', async () => {
      const mockResponse = {
        data: {
          submissionId: 'SUB-123',
          status: 'RECEIVED',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useOnboardingStore());

      // Fill draft
      act(() => {
        result.current.updateProfile({
          fullName: 'John Doe',
          dateOfBirth: '1990-05-15',
          nationality: 'US',
        });
        result.current.updateDocument({
          documentType: 'PASSPORT',
          documentNumber: 'P12345678',
        });
        result.current.updateAddress({
          addressLine1: '123 Main St',
          city: 'Springfield',
          country: 'US',
        });
        result.current.updateConsents({
          termsAccepted: true,
        });
      });

      await act(async () => {
        await result.current.submitOnboarding();
      });

      expect(result.current.submissionState).toBe('success');
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should handle submission errors', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid data',
              details: {
                fieldErrors: {
                  'profile.fullName': 'Required',
                },
              },
            },
          },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        await result.current.submitOnboarding();
      });

      expect(result.current.submissionState).toBe('error');
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('clearDraft', () => {
    it('should clear all draft data', async () => {
      const { result } = renderHook(() => useOnboardingStore());

      // Fill draft
      act(() => {
        result.current.updateProfile({
          fullName: 'John Doe',
          dateOfBirth: '1990-05-15',
          nationality: 'US',
        });
        result.current.setCurrentStep(2);
      });

      // Clear
      await act(async () => {
        await result.current.clearDraft();
      });

      expect(result.current.draft.profile.fullName).toBe('');
      expect(result.current.currentStep).toBe(0);
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('loadPersistedDraft', () => {
    it('should restore draft from AsyncStorage', async () => {
      const persistedDraft = JSON.stringify({
        draft: {
          profile: {
            fullName: 'Persisted User',
            dateOfBirth: '1985-01-01',
            nationality: 'UK',
          },
          document: {
            documentType: 'PASSPORT',
            documentNumber: 'UK123456',
          },
          address: {
            addressLine1: '456 Oak Ave',
            city: 'London',
            country: 'UK',
          },
          consents: {
            termsAccepted: false,
          },
        },
        currentStep: 3,
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(persistedDraft);

      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        await result.current.loadPersistedDraft();
      });

      expect(result.current.draft.profile.fullName).toBe('Persisted User');
      expect(result.current.currentStep).toBe(3);
    });

    it('should handle missing persisted data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useOnboardingStore());

      await act(async () => {
        await result.current.loadPersistedDraft();
      });

      // Should not crash and maintain default state
      expect(result.current.draft.profile.fullName).toBe('');
    });
  });
});
