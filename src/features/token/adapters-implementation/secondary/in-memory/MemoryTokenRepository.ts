import { injectable } from 'inversify';
import { TokenRepository } from '../../../domain/adapters/secondary/TokenRepository';

@injectable()
export class MemoryTokenRepository implements TokenRepository {
  private readonly tokens = new Set<string>();

  async save(token: string, _email: string): Promise<void> {
    this.tokens.add(token);
  }

  async exists(token: string): Promise<boolean> {
    return this.tokens.has(token);
  }
}
