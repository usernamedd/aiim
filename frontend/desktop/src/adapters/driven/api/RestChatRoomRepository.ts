// Adapter: REST Chat Room Repository (Real Implementation)
// Connects to Go backend at http://localhost:8080

import axios, { type AxiosInstance } from 'axios';
import type { ChatRoomRepository } from '../../../application/ports/driven/ChatRoomRepository';
import type { ChatRoom, ChatRoomId } from '../../../domain/entities/ChatRoom';
import { createChatRoom } from '../../../domain/entities/ChatRoom';

const API_BASE = 'http://localhost:8080/api/v1';

// Token storage — injected from container via setToken()
let authToken: string = '';

export function setChatRoomToken(token: string) {
  authToken = token;
}

function client(): AxiosInstance {
  const c = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
  // 请求拦截：注入 Bearer token
  c.interceptors.request.use((config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });
  return c;
}

// 后端 ChatDTO → 前端 ChatRoom
interface ChatDTO {
  id: string;
  type: string;         // "direct" | "group"
  name: string;
  avatar_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

function dtoToChatRoom(dto: ChatDTO): ChatRoom {
  return createChatRoom({
    id: dto.id,
    type: dto.type as 'private' | 'group',
    name: dto.name,
    avatar: dto.avatar_url,
    ownerId: dto.owner_id,
    memberIds: [],       // 后端单独查 members 接口，前端默认空
    lastMessageId: undefined,
    lastMessagePreview: undefined,
    lastMessageTime: undefined,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  });
}

export class RestChatRoomRepository implements ChatRoomRepository {
  async findById(chatRoomId: ChatRoomId): Promise<ChatRoom | null> {
    try {
      const res = await client().get(`/chats/${chatRoomId}`);
      if (res.data.code !== 0) return null;
      return dtoToChatRoom(res.data.data.chat);
    } catch {
      return null;
    }
  }

  async findAll(): Promise<ChatRoom[]> {
    // findAll 在纯 REST场景下等价于 GetRecentChats
    return this.findByUserId('');
 }

  async findByUserId(_userId: string): Promise<ChatRoom[]> {
    try {
      const res = await client().get('/chats/');
      if (res.data.code !== 0) return [];
      const chats: ChatDTO[] = res.data.data.chats ?? [];
      return chats.map(dtoToChatRoom);
    } catch {
      return [];
    }
  }

  async save(_chatRoom: ChatRoom): Promise<ChatRoom> {
    // REST 没有通用的 "create chat room" 接口
    // create via createDirectChat or createGroup
    return _chatRoom;
  }

  async update(chatRoom: ChatRoom): Promise<ChatRoom> {
    try {
      const res = await client().put(`/chats/${chatRoom.id}`, {
        name: chatRoom.name,
        avatar_url: chatRoom.avatar,
      });
      if (res.data.code !== 0) return chatRoom;
      return dtoToChatRoom(res.data.data.chat);
    } catch {
      return chatRoom;
    }
  }

  async delete(_chatRoomId: ChatRoomId): Promise<void> {
    // REST 没有 delete chat 接口 — leaveGroup替代
  }
}
