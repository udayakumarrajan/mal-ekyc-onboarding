import { OnboardingDraft, VerificationStatusResponse } from '../types';

interface OnboardingSubmission {
  id: string;
  userId: string;
  draft: OnboardingDraft;
  submittedAt: string;
}

class OnboardingRepository {
  private submissions: Map<string, OnboardingSubmission> = new Map();
  private verificationStatuses: Map<string, VerificationStatusResponse> = new Map();

  async createSubmission(
    submissionId: string,
    userId: string,
    draft: OnboardingDraft
  ): Promise<OnboardingSubmission> {
    const submission: OnboardingSubmission = {
      id: submissionId,
      userId,
      draft,
      submittedAt: new Date().toISOString(),
    };

    this.submissions.set(submissionId, submission);

    // Initialize verification status
    this.verificationStatuses.set(userId, {
      status: 'IN_PROGRESS',
      updatedAt: new Date().toISOString(),
      details: {
        reasons: [],
      },
    });

    return submission;
  }

  async getSubmissionById(submissionId: string): Promise<OnboardingSubmission | undefined> {
    return this.submissions.get(submissionId);
  }

  async getSubmissionsByUserId(userId: string): Promise<OnboardingSubmission[]> {
    return Array.from(this.submissions.values()).filter((sub) => sub.userId === userId);
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatusResponse> {
    const status = this.verificationStatuses.get(userId);
    if (status) {
      return status;
    }

    // Return NOT_STARTED if no submission exists
    return {
      status: 'NOT_STARTED',
      updatedAt: new Date().toISOString(),
      details: {
        reasons: [],
      },
    };
  }

  async updateVerificationStatus(
    userId: string,
    status: VerificationStatusResponse
  ): Promise<void> {
    this.verificationStatuses.set(userId, status);
  }

  // Trigger async verification (simulated with mock delay)
  triggerAsyncVerification(userId: string): void {
    const delay = Math.floor(Math.random() * 5000) + 3000; // 3-8 seconds
    const verification = this.verificationStatuses.get(userId);
    
    if (!verification) {
      return;
    }

    // Set status to IN_PROGRESS
    verification.status = 'IN_PROGRESS';
    verification.updatedAt = new Date().toISOString();

    // Simulate async processing with timeout
    setTimeout(() => {
      const outcomes: Array<'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW'> = [
        'APPROVED',
        'REJECTED',
        'MANUAL_REVIEW',
      ];
      const weights = [0.7, 0.2, 0.1]; // 70% approved, 20% rejected, 10% manual review
      const random = Math.random();
      let cumulative = 0;
      let selectedOutcome: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' = 'APPROVED';
      
      for (let i = 0; i < outcomes.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          selectedOutcome = outcomes[i];
          break;
        }
      }
      
      const currentStatus = this.verificationStatuses.get(userId);
      if (currentStatus) {
        currentStatus.status = selectedOutcome;
        currentStatus.updatedAt = new Date().toISOString();
        if (selectedOutcome === 'REJECTED') {
          currentStatus.details.reasons.push('Verification failed due to document mismatch');
        } else if (selectedOutcome === 'MANUAL_REVIEW') {
          currentStatus.details.reasons.push('Flagged for manual review');
        }
      }
    }, delay);
  }
}

export default new OnboardingRepository();
