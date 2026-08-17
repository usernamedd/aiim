// Adapter: REST User Repository (Real Implementation)
// Connects to Go backend at http://localhost:8080

import axios, { type AxiosInstance } from 'axios';
import type { UserRepository } from '../../../application/ports/driven/UserRepository';
import type { User, UserId } from '../../../domain/entities/User';
import { createUser } from '../../../domain/entities/User';

const API_BASE = 'http://localhost:8080/api/v1';

let authToken: string = '';

export function setUserToken(token: string) {
  authToken = token;
}

function client(): AxiosInstance {
  const c = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
  c.interceptors.request.use((config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });
  return c;
}

interface UserDTO {
  id: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  email?: string;
  status?: number;
}

function dtoToUser(dto: UserDTO): User {
  return createUser({
    id: dto.id,
    username: dto.username,
    nickname: dto.nickname || dto.username,
    email: dto.email,
    avatar: dto.avatar_url,
    isOnline: dto.status === 1,
  });
}

export class RestUserRepository implements UserRepository {
  async findById(userId: UserId): Promise<User | null> {
    try {
      const res = await client().get(`/users/${userId}`);
      if (res.data.code !== 0) return null;
      return dtoToUser(res.data.data.user);
    } catch {
      return null;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const res = await client().get('/users/search', {
        params: { q: username, limit: 1 },
      });
      if (res.data.code !== 0) return null;
      const users: UserDTO[] = res.data.data.users ?? [];
      return users.length > 0 ? dtoToUser(users[0]) : null;
    } catch {
      return null;
    }
  }

  async save(user: User): Promise<User> {
    // 后端没有独立的 save user API — 用户通过注册流程创建
    return user;
  }

  async update(user: User): Promise<User> {
    try {
      const res = await client().put('/users/profile', {
        nickname: user.nickname,
        avatar_url: user.avatar,
      });
      if (res.data.code !== 0) return user;
      return dtoToUser(res.data.data.user);
    } catch {
      return user;
    }
  }

  async findAll(): Promise<User[]> {
    // 后端没有 findAll 所有用户的接口 — 返回空
    return [];
  }
}
