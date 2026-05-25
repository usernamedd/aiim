// Driven Port: User Repository
// Implemented by adapters for user data access

import type { User, UserId } from '../../../domain/entities/User';

export interface UserRepository {
  findById(userId: UserId): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findAll(): Promise<User[]>;
}
