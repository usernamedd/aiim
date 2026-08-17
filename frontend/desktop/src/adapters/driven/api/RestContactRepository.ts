// Adapter: REST Contact Repository (Real Implementation)
// Connects to Go backend at http://localhost:8080

import axios, { type AxiosInstance } from 'axios';
import type { ContactRepository } from '../../../application/ports/driven/ContactRepository';
import type { Contact } from '../../../domain/entities/Contact';
import { createContact } from '../../../domain/entities/Contact';

const API_BASE = 'http://localhost:8080/api/v1';

let authToken: string = '';
let currentUserId: string = '';

export function setContactToken(token: string) {
  authToken = token;
}

export function setCurrentUserId(userId: string) {
  currentUserId = userId;
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

// 后端 UserDTO（来自 /users/search 和 /contacts）
interface UserDTO {
  id: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  status?: number; // 1=online, 0=offline
}

function dtoToContact(dto: UserDTO): Contact {
  return createContact({
    userId: currentUserId,
    friendId: dto.id,
    username: dto.username,
    nickname: dto.nickname || dto.username,
    avatar: dto.avatar_url,
    isOnline: dto.status === 1,
    isBlocked: false,
    createdAt: new Date(),
  });
}

export class RestContactRepository implements ContactRepository {
  async findAll(): Promise<Contact[]> {
    try {
      const res = await client().get('/contacts');
      if (res.data.code !== 0) return [];
      const users: UserDTO[] = res.data.data?.contacts ?? [];
      return users
        .filter(u => u.id !== currentUserId)
        .map(dtoToContact);
    } catch {
      return [];
    }
  }

  async findById(_id: string): Promise<Contact | null> {
    return null;
  }

  async search(query: string): Promise<Contact[]> {
    if (!query.trim()) return [];
    try {
      const res = await client().get('/users/search', {
        params: { q: query, limit: 20 },
      });
      if (res.data.code !== 0) return [];
      const users: UserDTO[] = res.data.data?.users ?? [];
      return users
        .filter(u => u.id !== currentUserId)
        .map(dtoToContact);
    } catch {
      return [];
    }
  }

  async save(contact: Contact): Promise<Contact> {
    try {
      await client().post('/chats/direct', { user_id: contact.friendId });
    } catch {
      // 非关键错误，contact 已存在时直接聊天会返回409
    }
    return contact;
  }

  async remove(contactId: string): Promise<void> {
    try {
      await client().delete(`/contacts/${contactId}`);
    } catch {
      // 忽略删除失败
    }
  }

  async block(_contactId: string): Promise<void> {
    // 后端暂无拉黑 API
  }

  async unblock(_contactId: string): Promise<void> {
    // 后端暂无拉黑 API
  }
}