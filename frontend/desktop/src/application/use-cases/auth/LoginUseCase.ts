// Use Case: Login
import type { AuthGateway } from '../../ports/driven/AuthGateway';
import type { UserRepository } from '../../ports/driven/UserRepository';
import type { Credentials } from '../../../domain/value-objects';
import type { User } from '../../../domain/entities';
import { createUserLoggedInEvent } from '../../../domain/events';

export interface LoginResult {
  user: User;
  events: ReturnType<typeof createUserLoggedInEvent>[];
}

export class LoginUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(credentials: Credentials): Promise<LoginResult> {
    const { user } = await this.authGateway.login(credentials);
    
    // Save user to local repo
    await this.userRepository.save(user);
    
    // Create domain event
    const event = createUserLoggedInEvent(user.id, user.username);
    
    return {
      user,
      events: [event],
    };
  }
}
