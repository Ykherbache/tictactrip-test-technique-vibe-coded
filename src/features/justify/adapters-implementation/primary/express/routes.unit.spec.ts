import { buildRouter } from './routes';
import express from 'express';

class FailingUseCase {
  async execute() {
    throw new Error('boom');
  }
}

describe('routes error branch', () => {
  it('returns 400 when usecase throws without status', async () => {
    const app = express();
    app.use(express.json());
    app.use(express.text({ type: 'text/plain' }));

    // minimal container mock
    const container: any = {
      get: (cls: any) => {
        if (cls.name === 'GenerateTokenUseCase') return { execute: () => 'tok' };
        if (cls.name === 'JustifyTextUseCase') return new FailingUseCase();
        if (cls.toString && cls.toString().includes('TokenRepository')) return { exists: async () => true };
        throw new Error('not bound');
      },
    };

    const router = buildRouter(container as any, 10);
    app.use(router);

    const res = await new Promise<{ status: number; body: any }>((resolve) => {
      const req = new (require('supertest')).Test(app, 'post', '/api/justify')
        .set('Authorization', 'Bearer tok')
        .set('Content-Type', 'text/plain')
        .send('hello');
      req.end((err: any, r: any) => resolve({ status: r.status, body: r.body }));
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('boom');
  });
});
