import request from 'supertest';
import app from '../src/app';

describe('Onboarding API', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Login to get access token
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    accessToken = response.body.session.accessToken;
  });

  describe('POST /v1/onboarding/submit', () => {
    const validDraft = {
      draft: {
        profile: {
          fullName: 'John Doe',
          dateOfBirth: '1990-05-15',
          nationality: 'US',
        },
        document: {
          documentType: 'PASSPORT',
          documentNumber: 'P12345678',
        },
        address: {
          addressLine1: '123 Main St',
          city: 'Springfield',
          country: 'US',
        },
        consents: {
          termsAccepted: true,
        },
      },
    };

    it('should submit onboarding successfully with valid data', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validDraft)
        .expect(200);

      expect(response.body).toHaveProperty('submissionId');
      expect(response.body).toHaveProperty('status', 'RECEIVED');
    });

    it('should return 400 with missing profile fields', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            profile: {},
            document: validDraft.draft.document,
            address: validDraft.draft.address,
            consents: validDraft.draft.consents,
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('fieldErrors');
      expect(response.body.error.details.fieldErrors['profile.fullName']).toBeDefined();
    });

    it('should return 400 with missing document fields', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            profile: validDraft.draft.profile,
            document: {},
            address: validDraft.draft.address,
            consents: validDraft.draft.consents,
          },
        })
        .expect(400);

      expect(response.body.error.details.fieldErrors['document.documentType']).toBeDefined();
      expect(response.body.error.details.fieldErrors['document.documentNumber']).toBeDefined();
    });

    it('should return 400 with invalid document type', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            ...validDraft.draft,
            document: {
              documentType: 'INVALID_TYPE',
              documentNumber: 'P12345678',
            },
          },
        })
        .expect(400);

      expect(response.body.error.details.fieldErrors['document.documentType']).toBeDefined();
    });

    it('should return 400 with terms not accepted', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            ...validDraft.draft,
            consents: {
              termsAccepted: false,
            },
          },
        })
        .expect(400);

      expect(response.body.error.details.fieldErrors['consents.termsAccepted']).toBeDefined();
    });

    it('should return 401 with no token', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .send(validDraft)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /v1/verification/status', () => {
    beforeAll(async () => {
      // Submit onboarding first
      await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          draft: {
            profile: {
              fullName: 'John Doe',
              dateOfBirth: '1990-05-15',
              nationality: 'US',
            },
            document: {
              documentType: 'PASSPORT',
              documentNumber: 'P12345678',
            },
            address: {
              addressLine1: '123 Main St',
              city: 'Springfield',
              country: 'US',
            },
            consents: {
              termsAccepted: true,
            },
          },
        });
    });

    it('should return verification status with valid token', async () => {
      const response = await request(app)
        .get('/v1/verification/status')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('reasons');
      expect(['NOT_STARTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW']).toContain(
        response.body.status
      );
    });

    it('should return 401 with no token', async () => {
      const response = await request(app)
        .get('/v1/verification/status')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
