import request from 'supertest';
import app from '../../src/app.js';
import { db } from '../../src/config/database.js';

describe('GET /health', () => {
  beforeAll(async () => {
    // Establish database connection before running tests
    await db.connect();
  });

  afterAll(async () => {
    // Close database connection after tests complete to avoid open handles
    await db.disconnect();
  });

  it('should return 200 OK and healthy status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.database.status).toBe('healthy');
  });
});
