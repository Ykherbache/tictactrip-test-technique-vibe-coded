import { injectable } from 'inversify';
import { QuotaStore } from '../../../domain/adapters/secondary/QuotaStore';
import { getUtcDayKey } from '../../../../../shared/time';

@injectable()
export class MemoryQuotaStore implements QuotaStore {
  private store: Map<string, number> = new Map();

  async incrementAndGet(wordCount: number, token: string, dailyLimit: number): Promise<{ total: number; allowed: boolean }> {
    const key = `${token}:${getUtcDayKey()}`;
    const current = this.store.get(key) ?? 0;
    const next = current + wordCount;
    this.store.set(key, next);
    return { total: next, allowed: next <= dailyLimit };
  }
}
