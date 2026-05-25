// Use Case: Refresh Token
import type { AuthGateway } from '../../ports/driven/AuthGateway';
import type { Token } from '../../../domain/value-objects';

export class RefreshTokenUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  async execute(refreshToken: string): Promise<Token> {
    return this.authGateway.refreshToken(refreshToken);
  }
}
