// Adapter: In-Memory User Repository
// Holds users in memory — use IndexedDB for persistence in production

import type { UserRepository } from '../../../application/ports/driven/UserRepository';
import type { User, UserId } from '../../../domain/entities';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<UserId, User> = new Map();

  async findById(userId: UserId): Promise<User | null> {
    return this.users.get(userId) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async update(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}
