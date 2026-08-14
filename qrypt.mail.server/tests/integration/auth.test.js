import request from 'supertest';
import app from '../../src/app.js';
import { db } from '../../src/config/database.js';

describe('Authentication Protected Endpoints', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 Unauthorized if authorization header is missing', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('should return 401 Unauthorized if token is malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 Unauthorized if authorization header is missing', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });
  });
});
