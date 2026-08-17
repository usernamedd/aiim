// Driving Port: Chat Service Interface
// Called by UI layer — defines what the UI can do with chat

import type { Message } from '../../../domain/entities/Message';
import type { MessageId } from '../../../domain/entities/Message';
import type { ChatRoom, ChatRoomId } from '../../../domain/entities/ChatRoom';
import type { Contact } from '../../../domain/entities/Contact';

export interface ChatService {
  // Chat Room
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(chatRoomId: ChatRoomId): Promise<ChatRoom | null>;
  createChatRoom(type: 'private' | 'group', name: string, memberIds: string[]): Promise<ChatRoom>;

  // Messages
  getMessages(chatRoomId: ChatRoomId, page: number, pageSize: number): Promise<Message[]>;
  sendMessage(chatRoomId: ChatRoomId, content: string, type: 'text' | 'image' | 'file' | 'code'): Promise<Message>;
  markAsRead(chatRoomId: ChatRoomId, messageId: MessageId): Promise<void>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  addContact(username: string): Promise<Contact>;
  removeContact(contactId: string): Promise<void>;

  // WebSocket
  connectWebSocket(): Promise<void>;
  disconnectWebSocket(): void;
  onMessageReceived(callback: (message: Message) => void): () => void;
}
