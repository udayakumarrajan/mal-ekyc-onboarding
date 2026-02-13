export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
}

export interface SessionResponse {
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
    documentType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';
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

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: {
      fieldErrors?: Record<string, string>;
    };
  };
}

export interface JWTPayload {
  userId: string;
  type: 'access' | 'refresh';
}
