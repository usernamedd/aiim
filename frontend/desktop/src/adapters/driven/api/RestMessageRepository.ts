// Adapter: REST Message Repository (Real Implementation)
// Connects to Go backend at http://localhost:8080

import axios, { type AxiosInstance } from 'axios';
import type { MessageRepository } from '../../../application/ports/driven/MessageRepository';
import type { Message, MessageId, MessageType, MessageStatus } from '../../../domain/entities/Message';
import { createMessage } from '../../../domain/entities/Message';

const API_BASE = 'http://localhost:8080/api/v1';

let authToken: string = '';

export function setMessageToken(token: string) {
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

// 后端 MessageDTO
interface MessageContentDTO {
  type: string;      // "text" | "image" | "file" | "code" | "voice"
  text: string;
  url?: string;
  mime?: string;
  size?: number;
  thumb?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface MessageDTO {
  id: string;
  chat_id: string;
  sender_id: string;
  content: MessageContentDTO;
  status: string; // "sent" | "delivered" | "read"
  created_at: string;
}

function dtoToMessage(dto: MessageDTO): Message {
  const typeMap: Record<string, MessageType> = {
    text: 'text',
    image: 'image',
    file: 'file',
    code: 'code',
    voice: 'file',
  };

  const statusMap: Record<string, MessageStatus> = {
    sent: 'sent',
    delivered: 'delivered',
    read: 'read',
  };

  return createMessage({
    id: dto.id,
    chatRoomId: dto.chat_id,
    senderId: dto.sender_id,
    type: typeMap[dto.content.type] ?? 'text',
    content: dto.content.text ?? '',
    fileUrl: dto.content.url,
    fileName: dto.content.mime ?? undefined,
    fileSize: dto.content.size,
    codeLanguage: dto.content.type === 'code' ? 'plaintext' : undefined,
    status: statusMap[dto.status] ?? 'sent',
    replyToId: undefined,
    createdAt: new Date(dto.created_at),
  });
}

export class RestMessageRepository implements MessageRepository {
  async findById(_messageId: MessageId): Promise<Message | null> {
    // REST 没有按 message_id 查单个消息的接口 — 返回 null
    return null;
  }

  async findByChatRoom(chatRoomId: string, _page: number, pageSize: number): Promise<Message[]> {
    try {
      const res = await client().get(`/chats/${chatRoomId}/messages`, {
        params: { limit: pageSize, before: '' },
      });
      if (res.data.code !== 0) return [];
      const messages: MessageDTO[] = res.data.data.messages ?? [];
      return messages.map(dtoToMessage);
    } catch {
      return [];
    }
  }

  async save(message: Message): Promise<Message> {
    // 消息通过 WebSocket 发送，HTTP 只用于历史记录拉取
    // save 仅当本地缓存需要持久化时使用
    return message;
  }

  async updateStatus(_messageId: MessageId, _status: MessageStatus): Promise<void> {
    // 已读状态通过 WebSocket mark_read消息通知后端
    // HTTP 没有单独的 updateStatus 接口
  }

  async delete(_messageId: MessageId): Promise<void> {
    // 后端暂无撤回消息 API
  }

  async count(_chatRoomId: string): Promise<number> {
    // 后端暂无 count 接口 — 返回 0 让前端自行分页
    return 0;
  }
}
