export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface OnboardingDraft {
  profile: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
  };
  document: {
    documentType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID' | '';
    documentNumber: string;
  };
  address: {
    addressLine1: string;
    city: string;
    country: string;
  };
  consents: {
    termsAccepted: boolean;
  };
}

export type VerificationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';

export interface VerificationStatusResponse {
  status: VerificationStatus;
  updatedAt: string;
  details: {
    reasons: string[];
  };
}

export type AuthStatus = 'logged_out' | 'logging_in' | 'logged_in' | 'refreshing' | 'expired';

export type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export type Theme = 'light' | 'dark';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: {
      fieldErrors?: Record<string, string>;
    };
  };
}
