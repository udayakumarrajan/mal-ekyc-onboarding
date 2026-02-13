import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import onboardingService from '../services/onboarding.service';
import { validateOnboardingSubmit } from '../middleware/validation.middleware';

const router = Router();

// POST /v1/onboarding/submit
router.post('/submit', authMiddleware, validateOnboardingSubmit, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { draft } = req.body;

    // Submit onboarding (validation is already done by middleware)
    const submissionId = await onboardingService.submitOnboarding(userId, draft);

    res.json({
      submissionId,
      status: 'RECEIVED',
    });
  } catch (error) {
    console.error('Submit onboarding error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while submitting onboarding',
      },
    });
  }
});

export default router;
