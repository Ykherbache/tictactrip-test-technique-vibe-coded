import { Router } from 'express';
import { Container } from 'inversify';
import { GenerateTokenUseCase } from '../../../../token/usecases/GenerateTokenUseCase';
import { JustifyTextUseCase } from '../../../usecases/JustifyTextUseCase';
import { requireAuth } from './auth-middleware';

export function buildRouter(container: Container, dailyLimit: number): Router {
  const router = Router();
  const generateToken = container.get<GenerateTokenUseCase>(GenerateTokenUseCase);
  const justifyText = container.get<JustifyTextUseCase>(JustifyTextUseCase);

  router.post('/api/token', async (req, res) => {
    try {
      const token = await generateToken.execute(req.body?.email);
      res.json({ token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/api/justify', requireAuth(container), async (req, res) => {
    const token = (req as any).token as string;
    try {
      const justified = await justifyText.execute({ token, text: req.body, dailyLimit, width: 80 });
      res.type('text/plain').send(justified);
    } catch (err: any) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message, total: err.total });
      }
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
