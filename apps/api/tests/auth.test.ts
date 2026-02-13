import request from 'supertest';
import app from '../src/app';

describe('Authentication API', () => {
  let accessToken: string;
  let refreshToken: string;

  describe('POST /v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('fullName');
      expect(response.body.session).toHaveProperty('accessToken');
      expect(response.body.session).toHaveProperty('refreshToken');
      expect(response.body.session).toHaveProperty('expiresAt');

      // Store tokens for later tests
      accessToken = response.body.session.accessToken;
      refreshToken = response.body.session.refreshToken;
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /v1/auth/refresh', () => {
    beforeAll(async () => {
      // Get a fresh session
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      refreshToken = response.body.session.refreshToken;
    });

    it('should refresh session with valid refresh token', async () => {
      const response = await request(app)
        .post('/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('accessToken');
      expect(response.body.session).toHaveProperty('refreshToken');
      expect(response.body.session).toHaveProperty('expiresAt');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_INVALID');
    });
  });

  describe('GET /v1/me', () => {
    beforeAll(async () => {
      // Get a fresh session
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      accessToken = response.body.session.accessToken;
    });

    it('should return current user with valid access token', async () => {
      const response = await request(app)
        .get('/v1/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('fullName');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 with no token', async () => {
      const response = await request(app)
        .get('/v1/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/v1/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_INVALID');
    });
  });
});
