// Adapter: In-Memory Message Repository
// Holds messages in memory — use IndexedDB for persistence in production

import type { MessageRepository } from '../../../application/ports/driven/MessageRepository';
import type { Message, MessageId, ChatRoomId } from '../../../domain/entities';

export class InMemoryMessageRepository implements MessageRepository {
  private messages: Map<MessageId, Message> = new Map();
  private indexByChatRoom: Map<ChatRoomId, MessageId[]> = new Map();

  async findById(messageId: MessageId): Promise<Message | null> {
    return this.messages.get(messageId) ?? null;
  }

  async findByChatRoom(chatRoomId: ChatRoomId, page: number, pageSize: number): Promise<Message[]> {
    const ids = this.indexByChatRoom.get(chatRoomId) ?? [];
    const start = (page - 1) * pageSize;
    const pagedIds = ids.slice(start, start + pageSize);
    return pagedIds.map(id => this.messages.get(id)).filter(Boolean) as Message[];
  }

  async save(message: Message): Promise<Message> {
    this.messages.set(message.id, message);
    
    const ids = this.indexByChatRoom.get(message.chatRoomId) ?? [];
    if (!ids.includes(message.id)) {
      ids.push(message.id);
      this.indexByChatRoom.set(message.chatRoomId, ids);
    }
    
    return message;
  }

  async updateStatus(messageId: MessageId, status: Message['status']): Promise<void> {
    const msg = this.messages.get(messageId);
    if (msg) {
      this.messages.set(messageId, { ...msg, status });
    }
  }

  async delete(messageId: MessageId): Promise<void> {
    const msg = this.messages.get(messageId);
    if (msg) {
      this.messages.delete(messageId);
      const ids = this.indexByChatRoom.get(msg.chatRoomId) ?? [];
      this.indexByChatRoom.set(msg.chatRoomId, ids.filter(id => id !== messageId));
    }
  }

  async count(chatRoomId: ChatRoomId): Promise<number> {
    return (this.indexByChatRoom.get(chatRoomId) ?? []).length;
  }
}
