import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

declare global {
  // eslint-disable-next-line no-var
  var __REDIS_CONTAINER__: StartedRedisContainer | undefined;
  // eslint-disable-next-line no-var
  var __REDIS_URL__: string | undefined;
}

export default async function globalSetup() {
  const container = await new RedisContainer('redis:7').start();
  const url = container.getConnectionUrl();
  global.__REDIS_CONTAINER__ = container;
  global.__REDIS_URL__ = url;
  process.env.REDIS_URL = url;
}
