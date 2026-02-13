import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import onboardingService from '../services/onboarding.service';

const router = Router();

// GET /v1/verification/status
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const status = await onboardingService.getVerificationStatus(userId);

    res.json(status);
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching verification status',
      },
    });
  }
});

export default router;
