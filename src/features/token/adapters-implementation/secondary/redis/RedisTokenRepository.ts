import { injectable } from 'inversify';
import { createClient, RedisClientType } from 'redis';
import { TokenRepository } from '../../../domain/adapters/secondary/TokenRepository';
import { getUtcDayKey } from '../../../../../shared/time';

@injectable()
export class RedisTokenRepository implements TokenRepository {
  private client: RedisClientType;

  constructor(private url: string) {
    this.client = createClient({ url });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  private key(token: string): string {
    // scope by day to avoid unbounded growth; tokens valid for the day
    return `token:${getUtcDayKey()}:${token}`;
  }

  async save(token: string, _email: string): Promise<void> {
    const ttlSeconds = 24 * 60 * 60;
    await this.client.set(this.key(token), '1', { EX: ttlSeconds });
  }

  async exists(token: string): Promise<boolean> {
    const v = await this.client.get(this.key(token));
    return v !== null;
  }
}
