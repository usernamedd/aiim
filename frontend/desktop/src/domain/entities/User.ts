// Domain Entity: User
// Pure domain object with no external dependencies

export type UserId = string;

export interface User {
  readonly id: UserId;
  readonly username: string;
  readonly nickname: string;
  readonly avatar?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly isOnline: boolean;
  readonly createdAt: Date;
}

export function createUser(params: {
  id: UserId;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  isOnline?: boolean;
  createdAt?: Date;
}): User {
  return {
    id: params.id,
    username: params.username,
    nickname: params.nickname,
    avatar: params.avatar,
    email: params.email,
    phone: params.phone,
    isOnline: params.isOnline ?? false,
    createdAt: params.createdAt ?? new Date(),
  };
}