import { Container } from 'inversify';
import { requireAuth } from './auth-middleware';
import { TYPES } from '../../../../../container/types';

function makeMockReq(headerValue?: string) {
  return {
    header: (name: string) => (name.toLowerCase() === 'authorization' ? headerValue : undefined),
  } as any;
}

function makeMockRes() {
  const res: any = {
    statusCode: 200,
    body: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe('auth-middleware', () => {
  it('rejects empty bearer token', async () => {
    const req: any = makeMockReq('Bearer ');
    const res = makeMockRes();
    const next = jest.fn();
    const container = new Container();
    container.bind(TYPES.TokenRepository).toConstantValue({ exists: async () => true, save: async () => undefined });
    await requireAuth(container)(req, res as any, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Missing or invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 500 when repo throws', async () => {
    const req: any = makeMockReq('Bearer tok');
    const res = makeMockRes();
    const next = jest.fn();
    const container = new Container();
    container.bind(TYPES.TokenRepository).toConstantValue({
      save: async () => undefined,
      exists: async () => {
        throw new Error('repo failure');
      },
    });
    await requireAuth(container)(req, res as any, next);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Token validation failed' });
    expect(next).not.toHaveBeenCalled();
  });
});
