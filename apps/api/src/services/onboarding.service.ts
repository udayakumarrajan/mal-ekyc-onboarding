import { v4 as uuidv4 } from 'uuid';
import { OnboardingDraft, VerificationStatusResponse } from '../types';
import onboardingRepository from '../repositories/onboarding.repository';

class OnboardingService {
  async submitOnboarding(userId: string, draft: OnboardingDraft): Promise<string> {
    // Generate submission ID
    const submissionId = `SUB-${uuidv4()}`;

    // Create submission
    await onboardingRepository.createSubmission(submissionId, userId, draft);

    // Trigger async verification (M3 feature - simulates background processing)
    onboardingRepository.triggerAsyncVerification(userId);

    return submissionId;
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatusResponse> {
    return await onboardingRepository.getVerificationStatus(userId);
  }

  async updateVerificationStatus(
    userId: string,
    status: VerificationStatusResponse
  ): Promise<void> {
    await onboardingRepository.updateVerificationStatus(userId, status);
  }

  validateDraft(draft: OnboardingDraft): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validate profile
    if (!draft.profile?.fullName || draft.profile.fullName.trim().length === 0) {
      errors['profile.fullName'] = 'Full name is required';
    }
    if (!draft.profile?.dateOfBirth) {
      errors['profile.dateOfBirth'] = 'Date of birth is required';
    }
    if (!draft.profile?.nationality || draft.profile.nationality.trim().length === 0) {
      errors['profile.nationality'] = 'Nationality is required';
    }

    // Validate document
    if (!draft.document?.documentType) {
      errors['document.documentType'] = 'Document type is required';
    } else if (!['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID'].includes(draft.document.documentType)) {
      errors['document.documentType'] = 'Invalid document type';
    }
    if (!draft.document?.documentNumber || draft.document.documentNumber.trim().length === 0) {
      errors['document.documentNumber'] = 'Document number is required';
    }

    // Validate address
    if (!draft.address?.addressLine1 || draft.address.addressLine1.trim().length === 0) {
      errors['address.addressLine1'] = 'Address line 1 is required';
    }
    if (!draft.address?.city || draft.address.city.trim().length === 0) {
      errors['address.city'] = 'City is required';
    }
    if (!draft.address?.country || draft.address.country.trim().length === 0) {
      errors['address.country'] = 'Country is required';
    }

    // Validate consents
    if (draft.consents?.termsAccepted !== true) {
      errors['consents.termsAccepted'] = 'Terms must be accepted';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default new OnboardingService();
