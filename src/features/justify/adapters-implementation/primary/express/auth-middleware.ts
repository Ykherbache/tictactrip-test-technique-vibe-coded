import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../../../../../container/types';
import { TokenRepository } from '../../../../token/domain/adapters/secondary/TokenRepository';
import { Container } from 'inversify';

export function requireAuth(container: Container) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.header('authorization');
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    const token = auth.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    const store = container.get<TokenRepository>(TYPES.TokenRepository);
    let exists = false;
    try {
      exists = await store.exists(token);
    } catch (e) {
      return res.status(500).json({ error: 'Token validation failed' });
    }
    if (!exists) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    (req as any).token = token;
    next();
  };
}
