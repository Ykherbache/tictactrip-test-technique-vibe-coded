import { injectable } from 'inversify';
import { WordCounter } from '../adapters/secondary/WordCounter';
import { normalizeWhitespace } from '../../../../shared/textUtils';

@injectable()
export class DefaultWordCounter implements WordCounter {
  count(text: string): number {
    const normalized = normalizeWhitespace(text);
    if (!normalized) return 0;
    return normalized.split(' ').length;
  }
}
