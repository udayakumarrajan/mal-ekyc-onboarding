import { Router, Request, Response } from 'express';
import authService from '../services/auth.service';
import { validateLogin, validateRefresh } from '../middleware/validation.middleware';

const router = Router();

// POST /v1/auth/login
router.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Attempt login
    const result = await authService.login(email, password);

    if (!result) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    const { user, session } = result;

    // Don't return password hash
    const { passwordHash, ...userResponse } = user;

    res.json({
      user: userResponse,
      session: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
    });
  }
});

// POST /v1/auth/refresh
router.post('/refresh', validateRefresh, async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const session = await authService.refreshSession(refreshToken);

    if (!session) {
      res.status(401).json({
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid or expired refresh token',
        },
      });
      return;
    }

    res.json({ session });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during token refresh',
      },
    });
  }
});

export default router;
