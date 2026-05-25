// Adapter: REST Auth Gateway (Mock Implementation)
// Simulates API calls — replace with real axios calls in production

import type { AuthGateway } from '../../../application/ports/driven/AuthGateway';
import type { Token, Credentials, RegisterParams } from '../../../domain/value-objects';
import { createToken } from '../../../domain/value-objects';
import { createUser, type User } from '../../../domain/entities/User';

const MOCK_DELAY = 500;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class RestAuthGateway implements AuthGateway {
  async login(credentials: Credentials): Promise<{ token: Token; user: User }> {
    await delay(MOCK_DELAY);
    
    // Mock: accept any credentials with password "password"
    if (credentials.password !== 'password') {
      throw new Error('Invalid credentials');
    }
    
    const user = createUser({
      id: crypto.randomUUID(),
      username: credentials.username,
      nickname: credentials.username,
      isOnline: true,
    });
    
    const token = createToken({
      accessToken: 'mock-access-token-' + crypto.randomUUID(),
      refreshToken: 'mock-refresh-token-' + crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    return { token, user };
  }

  async register(params: RegisterParams): Promise<{ token: Token; user: User }> {
    await delay(MOCK_DELAY);
    
    const user = createUser({
      id: crypto.randomUUID(),
      username: params.username,
      nickname: params.nickname,
      email: params.email,
      phone: params.phone,
      isOnline: true,
    });
    
    const token = createToken({
      accessToken: 'mock-access-token-' + crypto.randomUUID(),
      refreshToken: 'mock-refresh-token-' + crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    return { token, user };
  }

  async refreshToken(_refreshToken: string): Promise<Token> {
    await delay(MOCK_DELAY);
    
    return createToken({
      accessToken: 'mock-access-token-' + crypto.randomUUID(),
      refreshToken: 'mock-refresh-token-' + crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  async logout(): Promise<void> {
    await delay(MOCK_DELAY / 2);
  }
}
