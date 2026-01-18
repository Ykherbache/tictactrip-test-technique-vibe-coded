import { inject, injectable } from 'inversify';
import { TYPES } from '../../../container/types';
import { TokenGenerator } from '../domain/adapters/secondary/TokenGenerator';
import { TokenRepository } from '../domain/adapters/secondary/TokenRepository';
import { AbstractUseCase } from '../../shared/AbstractUseCase';

@injectable()
export class GenerateTokenUseCase extends AbstractUseCase<string, string> {
  constructor(
    @inject(TYPES.TokenGenerator) private generator: TokenGenerator,
    @inject(TYPES.TokenRepository) private tokenRepository: TokenRepository
  ) {
    super();
  }

  protected async handle(email: string): Promise<string> {
    if (!email || typeof email !== 'string') {
      throw new Error('Email requis');
    }
    const token = this.generator.generate();
    await this.tokenRepository.save(token, email);
    return token;
  }
}
