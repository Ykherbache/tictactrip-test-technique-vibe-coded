import { injectable } from 'inversify';
import { v4 as uuid } from 'uuid';
import { TokenGenerator } from '../../../domain/adapters/secondary/TokenGenerator';

@injectable()
export class UuidTokenGenerator implements TokenGenerator {
  generate(): string {
    return uuid();
  }
}
