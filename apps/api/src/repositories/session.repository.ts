import { Session } from '../types';

class SessionRepository {
  private sessions: Map<string, Session> = new Map(); // key: accessToken or refreshToken
  private userSessions: Map<string, string[]> = new Map(); // key: userId, value: token[]

  async create(session: Session): Promise<Session> {
    // Store by both access and refresh token for easy lookup
    this.sessions.set(session.accessToken, session);
    this.sessions.set(session.refreshToken, session);

    // Track user's sessions
    const userTokens = this.userSessions.get(session.userId) || [];
    userTokens.push(session.accessToken, session.refreshToken);
    this.userSessions.set(session.userId, userTokens);

    return session;
  }

  async findByAccessToken(accessToken: string): Promise<Session | undefined> {
    return this.sessions.get(accessToken);
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | undefined> {
    return this.sessions.get(refreshToken);
  }

  async deleteByToken(token: string): Promise<boolean> {
    const session = this.sessions.get(token);
    if (!session) return false;

    // Delete both tokens
    this.sessions.delete(session.accessToken);
    this.sessions.delete(session.refreshToken);

    // Remove from user sessions
    const userTokens = this.userSessions.get(session.userId);
    if (userTokens) {
      const filtered = userTokens.filter(
        (t) => t !== session.accessToken && t !== session.refreshToken
      );
      if (filtered.length > 0) {
        this.userSessions.set(session.userId, filtered);
      } else {
        this.userSessions.delete(session.userId);
      }
    }

    return true;
  }

  async deleteAllForUser(userId: string): Promise<void> {
    const userTokens = this.userSessions.get(userId);
    if (!userTokens) return;

    // Delete all sessions
    userTokens.forEach((token) => this.sessions.delete(token));
    this.userSessions.delete(userId);
  }
}

export default new SessionRepository();
