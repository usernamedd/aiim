// Adapter: In-Memory Chat Room Repository
// Holds chat rooms in memory — use IndexedDB for persistence in production

import type { ChatRoomRepository } from '../../../application/ports/driven/ChatRoomRepository';
import type { ChatRoom, ChatRoomId } from '../../../domain/entities';

export class InMemoryChatRoomRepository implements ChatRoomRepository {
  private chatRooms: Map<ChatRoomId, ChatRoom> = new Map();

  async findById(chatRoomId: ChatRoomId): Promise<ChatRoom | null> {
    return this.chatRooms.get(chatRoomId) ?? null;
  }

  async findAll(): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values());
  }

  async findByUserId(userId: string): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values()).filter(room => 
      room.memberIds.includes(userId)
    );
  }

  async save(chatRoom: ChatRoom): Promise<ChatRoom> {
    this.chatRooms.set(chatRoom.id, chatRoom);
    return chatRoom;
  }

  async update(chatRoom: ChatRoom): Promise<ChatRoom> {
    this.chatRooms.set(chatRoom.id, chatRoom);
    return chatRoom;
  }

  async delete(chatRoomId: ChatRoomId): Promise<void> {
    this.chatRooms.delete(chatRoomId);
  }
}
