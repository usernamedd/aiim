// Use Case: Register
import type { AuthGateway } from '../../ports/driven/AuthGateway';
import type { UserRepository } from '../../ports/driven/UserRepository';
import type { RegisterParams, Token } from '../../../domain/value-objects';
import type { User } from '../../../domain/entities';
import { createUserRegisteredEvent } from '../../../domain/events';

export interface RegisterResult {
  user: User;
  token: Token;
  events: ReturnType<typeof createUserRegisteredEvent>[];
}

export class RegisterUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: RegisterParams): Promise<RegisterResult> {
    const { token, user } = await this.authGateway.register(params);
    
    await this.userRepository.save(user);
    
    const event = createUserRegisteredEvent(user.id, user.username);
    
    return {
      user,
      token,
      events: [event],
    };
  }
}
