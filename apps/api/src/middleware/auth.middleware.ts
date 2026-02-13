import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'TOKEN_MISSING',
          message: 'Authorization token is required',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const userId = await authService.verifyAccessToken(token);

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'TOKEN_INVALID',
            message: 'Invalid authorization token',
          },
        });
        return;
      }

      req.userId = userId;
      next();
    } catch (error: any) {
      if (error.message === 'TOKEN_EXPIRED') {
        res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authorization token has expired',
          },
        });
        return;
      }

      res.status(401).json({
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid authorization token',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
