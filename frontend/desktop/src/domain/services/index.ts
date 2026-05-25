// ============================================================
// Domain Services
// Pure functions with no side effects / external dependencies
// ============================================================

import type { Message, MessageType } from '../entities/Message';
import type { ChatRoom } from '../entities/ChatRoom';
import type { UserId } from '../entities/User';

// Validate message content
export function validateMessageContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message content cannot be empty' };
  }
  if (content.length > 10000) {
    return { valid: false, error: 'Message content exceeds maximum length (10000)' };
  }
  return { valid: true };
}

// Check if user can send message in chat room
export function canUserSendMessage(chatRoom: ChatRoom, userId: UserId): boolean {
  if (chatRoom.type === 'private') {
    return chatRoom.memberIds.includes(userId);
  }
  // Group chat: any member can send
  return chatRoom.memberIds.includes(userId);
}

// Get unread message count for a user in a chat room
export function calculateUnreadCount(messages: Message[], lastReadAt: Date, userId: UserId): number {
  return messages.filter(
    (msg) =>
      msg.senderId !== userId &&
      msg.status !== 'read' &&
      msg.createdAt > lastReadAt
  ).length;
}

// Determine message type from content
export function detectMessageType(content: string): MessageType {
  // Image URL patterns
  if (/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp|svg)/i.test(content)) {
    return 'image';
  }
  // Code block detection
  if (content.startsWith('```') || /^(function|const|let|var|import|export|class|def |pub fn )/m.test(content)) {
    return 'code';
  }
  // File attachment detection (simple heuristic)
  if (/\[file:.*\]/.test(content)) {
    return 'file';
  }
  return 'text';
}

// Sort chat rooms by last message time
export function sortChatRoomsByLastMessage(rooms: ChatRoom[]): ChatRoom[] {
  return [...rooms].sort((a, b) => {
    // Pinned rooms first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by last message time
    const aTime = a.lastMessageTime?.getTime() ?? 0;
    const bTime = b.lastMessageTime?.getTime() ?? 0;
    return bTime - aTime;
  });
}

// Filter messages by type
export function filterMessagesByType(messages: Message[], type: MessageType): Message[] {
  return messages.filter((msg) => msg.type === type);
}

// Pagination helper
export function paginateMessages(messages: Message[], page: number, pageSize: number): Message[] {
  const start = (page - 1) * pageSize;
  return messages.slice(start, start + pageSize);
}

// Check if chat room is accessible
export function isChatRoomAccessible(room: ChatRoom, userId: UserId): boolean {
  return room.memberIds.includes(userId);
}

// Get chat room display name
export function getChatRoomDisplayName(room: ChatRoom, _currentUserId: UserId): string {
  if (room.type === 'group') {
    return room.name;
  }
  // For private chat, could show the other user's nickname
  return room.name;
}