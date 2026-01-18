export interface QuotaStore {
  incrementAndGet(wordCount: number, token: string, dailyLimit: number): Promise<{ total: number; allowed: boolean }>;
}
