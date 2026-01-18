export interface TokenRepository {
  save(token: string, email: string): Promise<void>;
  exists(token: string): Promise<boolean>;
}
