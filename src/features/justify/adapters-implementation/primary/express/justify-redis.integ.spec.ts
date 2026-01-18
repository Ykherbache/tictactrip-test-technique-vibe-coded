import request from 'supertest';
import { createRedisTestApp } from '../../../../../app';

const DAILY_LIMIT = 3; // small to trigger quota quickly

describe('Justify routes with Redis (integration)', () => {
  it('exercises token issuance, auth, justify, quota, and error branches', async () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL not set in integration env');

    const { app, shutdown } = await createRedisTestApp(redisUrl, DAILY_LIMIT);

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

    // First call: 2 words
    const first = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('one two');
    expect(first.status).toBe(200);

    // Second call: +1 word -> hits limit exactly 3
    const second = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('three');
    expect(second.status).toBe(200);

    // Third call: exceeds limit -> 402
    const third = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'text/plain')
      .send('four');
    expect(third.status).toBe(402);

    await shutdown();
  });
});
