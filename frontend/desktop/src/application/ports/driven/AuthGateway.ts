// Driven Port: Auth Gateway
// Implemented by adapters (REST API, mock, etc.)
// Use Cases call this to interact with auth backend

import type { Token, Credentials, RegisterParams } from '../../../domain/value-objects';
import type { User } from '../../../domain/entities';

export interface AuthGateway {
  login(credentials: Credentials): Promise<{ token: Token; user: User }>;
  register(params: RegisterParams): Promise<{ token: Token; user: User }>;
  refreshToken(refreshToken: string): Promise<Token>;
  logout(): Promise<void>;
}
