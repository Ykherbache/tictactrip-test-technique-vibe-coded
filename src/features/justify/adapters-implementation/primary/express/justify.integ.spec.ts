import request from 'supertest';
import { createTestApp } from '../../../../../app';

describe('Justify routes (integration, memory)', () => {
  const DAILY_LIMIT = 3; // small for tests

  it('covers auth, invalid body, quota, unknown token, and err.status path', async () => {
    const app = await createTestApp(DAILY_LIMIT);

    // Missing token -> 401
    const noAuth = await request(app).post('/api/justify').send('hello');
    expect(noAuth.status).toBe(401);

    // Invalid email -> 400
    const badToken = await request(app).post('/api/token').send({ email: 123 });
    expect(badToken.status).toBe(400);

    // Valid token
    const tokenRes = await request(app).post('/api/token').send({ email: 'foo@bar.com' });
    expect(tokenRes.status).toBe(200);
    const token = tokenRes.body.token as string;

    // Unknown token -> 401 (not in repo)
    const unknown = await request(app)
      .post('/api/justify')
      .set('Authorization', 'Bearer unknown')
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(unknown.status).toBe(401);

    // Invalid body (non-string) -> 400
    const invalidBody = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({ text: 'not-plain-text' });
    expect(invalidBody.status).toBe(400);

    // Force err.status branch (simulate quota exceeded via small limit and manual err)
    // Achieved below when exceeding DAILY_LIMIT.

    // First call: 2 words
    const first = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('one two');
    expect(first.status).toBe(200);

    // Second call: +1 word => hits limit exactly 3
    const second = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('three');
    expect(second.status).toBe(200);

    // Third call: exceeds limit => err.status 402 branch
    const third = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('four');
    expect(third.status).toBe(402);
        // Test branch: error without status property (non-string body)
    // This triggers the catch block at routes.ts:30 where err.status is undefined
    const nonStringBody = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({ notText: 'object' });
    expect(nonStringBody.status).toBe(400);
    expect(nonStringBody.body.error).toBe('Body text/plain requis');
  });
  });
