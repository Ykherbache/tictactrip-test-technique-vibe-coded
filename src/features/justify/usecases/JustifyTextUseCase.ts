import { inject, injectable } from 'inversify';
import { TYPES } from '../../../container/types';
import { QuotaStore } from '../domain/adapters/secondary/QuotaStore';
import { TextJustifier } from '../domain/adapters/secondary/TextJustifier';
import { WordCounter } from '../domain/adapters/secondary/WordCounter';
import { AbstractUseCase } from '../../shared/AbstractUseCase';

interface JustifyInput {
  token: string;
  text: string;
  dailyLimit: number;
  width: number;
}

@injectable()
export class JustifyTextUseCase extends AbstractUseCase<JustifyInput, string> {
  constructor(
    @inject(TYPES.QuotaStore) private quotaStore: QuotaStore,
    @inject(TYPES.TextJustifier) private justifier: TextJustifier,
    @inject(TYPES.WordCounter) private counter: WordCounter
  ) {
    super();
  }

  protected async handle({ token, text, dailyLimit, width}: JustifyInput): Promise<string> {
    if (typeof text !== 'string') {
      throw new Error('Body text/plain requis');
    }
    const words = this.counter.count(text);
    const { total, allowed } = await this.quotaStore.incrementAndGet(words, token, dailyLimit);
    if (!allowed) {
      const err: any = new Error('Quota quotidien dépassé');
      err.status = 402;
      err.total = total;
      throw err;
    }
    return this.justifier.justify(text, width);
  }
}
