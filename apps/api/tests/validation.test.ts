import request from 'supertest';
import app from '../src/app';

describe('Validation Tests', () => {
  describe('POST /v1/auth/login', () => {
    it('should return validation errors in consistent format for missing email', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({ password: 'test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return validation errors for invalid email format', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'invalid-email', password: 'test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return validation errors for missing password', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /v1/onboarding/submit', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      accessToken = loginResponse.body.session.accessToken;
    });

    it('should return fieldErrors for missing profile fields', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            profile: {
              fullName: '',
              dateOfBirth: '',
              nationality: '',
            },
            document: {
              documentType: 'PASSPORT',
              documentNumber: 'P123456',
            },
            address: {
              addressLine1: '123 Main St',
              city: 'City',
              country: 'US',
            },
            consents: {
              termsAccepted: true,
            },
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('fieldErrors');
    });

    it('should return fieldErrors for missing document fields', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            profile: {
              fullName: 'John Doe',
              dateOfBirth: '1990-01-01',
              nationality: 'US',
            },
            document: {
              documentType: 'PASSPORT',
              documentNumber: '',
            },
            address: {
              addressLine1: '123 Main St',
              city: 'City',
              country: 'US',
            },
            consents: {
              termsAccepted: true,
            },
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details.fieldErrors['document.documentNumber']).toBeDefined();
    });

    it('should return fieldErrors for missing address fields', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            profile: {
              fullName: 'John Doe',
              dateOfBirth: '1990-01-01',
              nationality: 'US',
            },
            document: {
              documentType: 'PASSPORT',
              documentNumber: 'P123456',
            },
            address: {
              addressLine1: '',
              city: '',
              country: '',
            },
            consents: {
              termsAccepted: true,
            },
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details.fieldErrors['address.addressLine1']).toBeDefined();
      expect(response.body.error.details.fieldErrors['address.city']).toBeDefined();
      expect(response.body.error.details.fieldErrors['address.country']).toBeDefined();
    });

    it('should return fieldErrors for missing consent', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            profile: {
              fullName: 'John Doe',
              dateOfBirth: '1990-01-01',
              nationality: 'US',
            },
            document: {
              documentType: 'PASSPORT',
              documentNumber: 'P123456',
            },
            address: {
              addressLine1: '123 Main St',
              city: 'City',
              country: 'US',
            },
            consents: {
              termsAccepted: false,
            },
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details.fieldErrors['consents.termsAccepted']).toBeDefined();
    });
  });

  describe('Error Consistency', () => {
    it('should return consistent error format for 404', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return consistent error format for unauthorized', async () => {
      const response = await request(app)
        .get('/v1/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(['UNAUTHORIZED', 'TOKEN_INVALID']).toContain(response.body.error.code);
    });
  });
});
