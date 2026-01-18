import { StartedRedisContainer } from '@testcontainers/redis';

declare global {
  // eslint-disable-next-line no-var
  var __REDIS_CONTAINER__: StartedRedisContainer | undefined;
  // eslint-disable-next-line no-var
  var __REDIS_URL__: string | undefined;
}

export default async function globalTeardown() {
  if (global.__REDIS_CONTAINER__) {
    await global.__REDIS_CONTAINER__.stop();
    global.__REDIS_CONTAINER__ = undefined;
  }
  global.__REDIS_URL__ = undefined;
}
