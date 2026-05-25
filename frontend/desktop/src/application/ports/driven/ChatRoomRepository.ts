// Driven Port: Chat Room Repository
// Implemented by adapters for chat room persistence

import type { ChatRoom, ChatRoomId } from '../../../domain/entities/ChatRoom';

export interface ChatRoomRepository {
  findById(chatRoomId: ChatRoomId): Promise<ChatRoom | null>;
  findAll(): Promise<ChatRoom[]>;
  findByUserId(userId: string): Promise<ChatRoom[]>;
  save(chatRoom: ChatRoom): Promise<ChatRoom>;
  update(chatRoom: ChatRoom): Promise<ChatRoom>;
  delete(chatRoomId: ChatRoomId): Promise<void>;
}
