import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { TokenGenerator } from '../features/token/domain/adapters/secondary/TokenGenerator';
import { TokenRepository } from '../features/token/domain/adapters/secondary/TokenRepository';
import { UuidTokenGenerator } from '../features/token/adapters-implementation/secondary/uuid/UuidTokenGenerator';
import { MemoryTokenRepository } from '../features/token/adapters-implementation/secondary/in-memory/MemoryTokenRepository';
import { RedisTokenRepository } from '../features/token/adapters-implementation/secondary/redis/RedisTokenRepository';
import { QuotaStore } from '../features/justify/domain/adapters/secondary/QuotaStore';
import { MemoryQuotaStore } from '../features/justify/adapters-implementation/secondary/in-memory/MemoryQuotaStore';
import { RedisQuotaStore } from '../features/justify/adapters-implementation/secondary/redis/RedisQuotaStore';
import { TextJustifier } from '../features/justify/domain/adapters/secondary/TextJustifier';
import { WordCounter } from '../features/justify/domain/adapters/secondary/WordCounter';
import { DefaultTextJustifier } from '../features/justify/domain/core/DefaultTextJustifier';
import { DefaultWordCounter } from '../features/justify/domain/core/DefaultWordCounter';

export function buildContainer() {
  const container = new Container();

  // Core domain services
  container.bind<TokenGenerator>(TYPES.TokenGenerator).to(UuidTokenGenerator).inSingletonScope();
  container.bind<TokenRepository>(TYPES.TokenRepository).to(MemoryTokenRepository).inSingletonScope();
  container.bind<TextJustifier>(TYPES.TextJustifier).to(DefaultTextJustifier).inSingletonScope();
  container.bind<WordCounter>(TYPES.WordCounter).to(DefaultWordCounter).inSingletonScope();

  // Quota store bound later depending on env; default memory
  container.bind<QuotaStore>(TYPES.QuotaStore).to(MemoryQuotaStore).inSingletonScope();

  return container;
}

export async function configureQuotaStore(container: Container, dailyLimit: number) {
  const useRedis = process.env.NODE_ENV === 'production' && process.env.REDIS_URL;
  if (container.isBound(TYPES.QuotaStore)) {
    container.unbind(TYPES.QuotaStore);
  }
  if (container.isBound(TYPES.TokenRepository)) {
    container.unbind(TYPES.TokenRepository);
  }

  if (useRedis && process.env.REDIS_URL) {
    const redisStore = new RedisQuotaStore(process.env.REDIS_URL);
    await redisStore.connect();
    container.bind<QuotaStore>(TYPES.QuotaStore).toConstantValue(redisStore); // instance connectée

    const redisTokenRepo = new RedisTokenRepository(process.env.REDIS_URL);
    await redisTokenRepo.connect();
    container.bind<TokenRepository>(TYPES.TokenRepository).toConstantValue(redisTokenRepo);
  } else {
    container.bind<QuotaStore>(TYPES.QuotaStore).toConstantValue(new MemoryQuotaStore());
    container.bind<TokenRepository>(TYPES.TokenRepository).toConstantValue(new MemoryTokenRepository());
  }
  return container;
}
