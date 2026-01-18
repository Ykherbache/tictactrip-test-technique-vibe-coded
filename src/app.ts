import 'reflect-metadata';
import express, { Express } from 'express';
import { Container } from 'inversify';
import { buildContainer, configureQuotaStore } from './container/inversify.config';
import { buildRouter } from './features/justify/adapters-implementation/primary/express/routes';
import { GenerateTokenUseCase } from './features/token/usecases/GenerateTokenUseCase';
import { JustifyTextUseCase } from './features/justify/usecases/JustifyTextUseCase';
import { TYPES } from './container/types';
import { MemoryQuotaStore } from './features/justify/adapters-implementation/secondary/in-memory/MemoryQuotaStore';
import { RedisQuotaStore } from './features/justify/adapters-implementation/secondary/redis/RedisQuotaStore';
import { MemoryTokenRepository } from './features/token/adapters-implementation/secondary/in-memory/MemoryTokenRepository';
import { RedisTokenRepository } from './features/token/adapters-implementation/secondary/redis/RedisTokenRepository';

const DEFAULT_DAILY_LIMIT = 80000;

function bindUseCases(container: Container) {
  container.bind(GenerateTokenUseCase).toSelf();
  container.bind(JustifyTextUseCase).toSelf();
}

async function buildExpressApp(container: Container, dailyLimit: number): Promise<Express> {
  const app = express();
  app.use(express.json());
  app.use(express.text({ type: 'text/plain' }));

  const router = buildRouter(container, dailyLimit);
  app.use(router);

  return app;
}

export async function createProductionApp(dailyLimit: number = DEFAULT_DAILY_LIMIT): Promise<Express> {
  const baseContainer = buildContainer();
  bindUseCases(baseContainer);
  const container = await configureQuotaStore(baseContainer, dailyLimit);
  return buildExpressApp(container, dailyLimit);
}

export async function createTestApp(dailyLimit: number = DEFAULT_DAILY_LIMIT): Promise<Express> {
  const baseContainer = buildContainer();
  bindUseCases(baseContainer);
  if (baseContainer.isBound(TYPES.QuotaStore)) {
    baseContainer.unbind(TYPES.QuotaStore);
  }
  if (baseContainer.isBound(TYPES.TokenRepository)) {
    baseContainer.unbind(TYPES.TokenRepository);
  }
  baseContainer.bind(TYPES.QuotaStore).toConstantValue(new MemoryQuotaStore());
  baseContainer.bind(TYPES.TokenRepository).toConstantValue(new MemoryTokenRepository());
  return buildExpressApp(baseContainer, dailyLimit);
}

export async function createRedisTestApp(redisUrl: string, dailyLimit: number = DEFAULT_DAILY_LIMIT): Promise<{ app: Express; shutdown: () => Promise<void> }> {
  const baseContainer = buildContainer();
  bindUseCases(baseContainer);
  if (baseContainer.isBound(TYPES.QuotaStore)) {
    baseContainer.unbind(TYPES.QuotaStore);
  }
  if (baseContainer.isBound(TYPES.TokenRepository)) {
    baseContainer.unbind(TYPES.TokenRepository);
  }
  const redisStore = new RedisQuotaStore(redisUrl);
  await redisStore.connect();
  const redisTokenRepo = new RedisTokenRepository(redisUrl);
  await redisTokenRepo.connect();
  baseContainer.bind(TYPES.QuotaStore).toConstantValue(redisStore);
  baseContainer.bind(TYPES.TokenRepository).toConstantValue(redisTokenRepo);
  const app = await buildExpressApp(baseContainer, dailyLimit);
  const shutdown = async () => {
    await redisStore.disconnect();
    await redisTokenRepo.disconnect();
  };
  return { app, shutdown };
}
