// Adapter: REST Auth Gateway (Real Implementation)
// Connects to Go backend at http://localhost:8080

import axios, { type AxiosInstance } from 'axios';
import type { AuthGateway } from '../../../application/ports/driven/AuthGateway';
import type { Token, Credentials, RegisterParams } from '../../../domain/value-objects';
import { createToken } from '../../../domain/value-objects';
import { createUser, type User } from '../../../domain/entities/User';

const API_BASE = 'http://localhost:8080/api/v1';

export class RestAuthGateway implements AuthGateway {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async login(credentials: Credentials): Promise<{ token: Token; user: User }> {
    const res = await this.client.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    if (res.data.code !== 0) {
      throw new Error(res.data.message || 'login failed');
    }

    const { user: userDTO, access_token, refresh_token, expires_at } = res.data.data;

    const user = createUser({
      id: userDTO.id,
      username: userDTO.username,
      nickname: userDTO.nickname || userDTO.username,
      email: userDTO.email,
      avatar: userDTO.avatar_url,
      isOnline: userDTO.status === 1,
    });

    const token = createToken({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(expires_at),
    });

    return { token, user };
  }

  async register(params: RegisterParams): Promise<{ token: Token; user: User }> {
    const res = await this.client.post('/auth/register', {
      username: params.username,
      email: params.email || '',
      password: params.password,
      nickname: params.nickname,
    });

    if (res.data.code !== 0) {
      throw new Error(res.data.message || 'register failed');
    }

    const { user_id, username, email, nickname } = res.data.data;

    const user = createUser({
      id: user_id,
      username,
      nickname: nickname || username,
      email,
 isOnline: true,
    });

    // Register doesn't return tokens — user must login after register
    const token = createToken({
      accessToken: '',
      refreshToken: '',
      expiresAt: new Date(),
    });

    return { token, user };
  }

  async refreshToken(refreshToken: string): Promise<Token> {
    const res = await this.client.post('/auth/refresh', { refresh_token: refreshToken });

    if (res.data.code !== 0) {
      throw new Error(res.data.message || 'refresh failed');
    }

    const { access_token, refresh_token, expires_at } = res.data.data;

    return createToken({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(expires_at),
    });
  }

  async logout(): Promise<void> {
    // Note: real logout needs session_id — bridge via token if needed
    await this.client.post('/auth/logout', { session_id: '' }).catch(() => {
      // best-effort
    });
  }
}
