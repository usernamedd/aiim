// Driving Port: Auth Service Interface
// Called by UI layer — defines what the UI can do with authentication

import type { Token } from '../../../domain/value-objects';
import type { Credentials, RegisterParams } from '../../../domain/value-objects';
import type { User } from '../../../domain/entities/User';

export { type Token, type Credentials, type RegisterParams };

export interface AuthService {
  login(credentials: Credentials): Promise<{ token: Token; user: User }>;
  register(params: RegisterParams): Promise<{ token: Token; user: User }>;
  logout(): Promise<void>;
  refreshToken(): Promise<Token>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
}
