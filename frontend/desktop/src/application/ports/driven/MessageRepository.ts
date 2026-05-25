// Driven Port: Message Repository
// Implemented by adapters (in-memory, IndexedDB, REST API, etc.)
// Use Cases call this for message persistence

import type { Message, MessageId } from '../../../domain/entities/Message';
import type { ChatRoomId } from '../../../domain/entities/ChatRoom';

export interface MessageRepository {
  findById(messageId: MessageId): Promise<Message | null>;
  findByChatRoom(chatRoomId: ChatRoomId, page: number, pageSize: number): Promise<Message[]>;
  save(message: Message): Promise<Message>;
  updateStatus(messageId: MessageId, status: Message['status']): Promise<void>;
  delete(messageId: MessageId): Promise<void>;
  count(chatRoomId: ChatRoomId): Promise<number>;
}
