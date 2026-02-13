import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, Session, SessionResponse, JWTPayload } from '../types';
import userRepository from '../repositories/user.repository';
import sessionRepository from '../repositories/session.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

class AuthService {
  async login(email: string, password: string): Promise<{ user: User; session: Session } | null> {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    // Generate tokens
    const session = await this.generateSession(user.id);

    return { user, session };
  }

  async generateSession(userId: string): Promise<Session> {
    const accessPayload: JWTPayload = {
      userId,
      type: 'access',
    };

    const refreshPayload: JWTPayload = {
      userId,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    // Calculate expiry time
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15); // 15 minutes from now
    const expiresAt = now.toISOString();

    const session: Session = {
      accessToken,
      refreshToken,
      expiresAt,
      userId,
    };

    // Store session
    await sessionRepository.create(session);

    return session;
  }

  async refreshSession(refreshToken: string): Promise<SessionResponse | null> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;

      if (payload.type !== 'refresh') {
        return null;
      }

      // Check if session exists
      const existingSession = await sessionRepository.findByRefreshToken(refreshToken);
      if (!existingSession) {
        return null;
      }

      // Delete old session
      await sessionRepository.deleteByToken(refreshToken);

      // Generate new session
      const newSession = await this.generateSession(payload.userId);

      return {
        accessToken: newSession.accessToken,
        refreshToken: newSession.refreshToken,
        expiresAt: newSession.expiresAt,
      };
    } catch (error) {
      return null;
    }
  }

  async verifyAccessToken(accessToken: string): Promise<string | null> {
    try {
      const payload = jwt.verify(accessToken, JWT_SECRET) as JWTPayload;

      if (payload.type !== 'access') {
        return null;
      }

      return payload.userId;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      return null;
    }
  }

  async logout(accessToken: string): Promise<void> {
    await sessionRepository.deleteByToken(accessToken);
  }
}

export default new AuthService();
