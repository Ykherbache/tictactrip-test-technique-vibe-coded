import { injectable } from 'inversify';
import { createClient, RedisClientType } from 'redis';
import { QuotaStore } from '../../../domain/adapters/secondary/QuotaStore';
import { getUtcDayKey } from '../../../../../shared/time';

@injectable()
export class RedisQuotaStore implements QuotaStore {
  private client: RedisClientType;

  constructor(private url: string) {
    this.client = createClient({ url });
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  async incrementAndGet(wordCount: number, token: string, dailyLimit: number): Promise<{ total: number; allowed: boolean }> {
    const key = `${token}:${getUtcDayKey()}`;
    const ttlSeconds = 24 * 60 * 60;
    const responses = await this.client.multi().incrBy(key, wordCount).expire(key, ttlSeconds).exec();
    let next = wordCount;
    let potentialNum = Number(responses?.[0])
    if (potentialNum) {
      next = potentialNum
    }
    return { total: next, allowed: next <= dailyLimit };
  }
}
