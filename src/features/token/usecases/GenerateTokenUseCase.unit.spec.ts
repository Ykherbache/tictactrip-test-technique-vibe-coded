import { GenerateTokenUseCase } from './GenerateTokenUseCase';

describe('GenerateTokenUseCase', () => {
  class FakeTokenGenerator {
    generate() {
      return 'fake-token';
    }
  }

  class FakeTokenRepository {
    saved: string | null = null;
    async save(token: string) {
      this.saved = token;
    }
    async exists() {
      return true;
    }
  }

  it('returns a token when email is valid and stores it', async () => {
    const repo = new FakeTokenRepository();
    const usecase = new GenerateTokenUseCase(new FakeTokenGenerator() as any, repo as any);
    const token = await usecase.execute('foo@bar.com');
    expect(token).toBe('fake-token');
    expect(repo.saved).toBe('fake-token');
  });

  it('throws on invalid email', async () => {
    const repo = new FakeTokenRepository();
    const usecase = new GenerateTokenUseCase(new FakeTokenGenerator() as any, repo as any);
    await expect(usecase.execute('')).rejects.toThrow('Email requis');
  });
});
