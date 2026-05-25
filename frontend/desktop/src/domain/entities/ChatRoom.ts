// Domain Entity: ChatRoom
// Pure domain object with no external dependencies

import type { UserId } from './User';

export type ChatRoomId = string;

export type ChatRoomType = 'private' | 'group';

export interface ChatRoom {
  readonly id: ChatRoomId;
  readonly type: ChatRoomType;
  readonly name: string;
  readonly avatar?: string;
  readonly ownerId: UserId;
  readonly memberIds: UserId[];
  readonly lastMessageId?: string;
  readonly lastMessagePreview?: string;
  readonly lastMessageTime?: Date;
  readonly unreadCount: number;
  readonly isPinned: boolean;
  readonly isMuted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function createChatRoom(params: {
  id: ChatRoomId;
  type: ChatRoomType;
  name: string;
  avatar?: string;
  ownerId: UserId;
  memberIds?: UserId[];
  lastMessageId?: string;
  lastMessagePreview?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}): ChatRoom {
  return {
    id: params.id,
    type: params.type,
    name: params.name,
    avatar: params.avatar,
    ownerId: params.ownerId,
    memberIds: params.memberIds ?? [],
    lastMessageId: params.lastMessageId,
    lastMessagePreview: params.lastMessagePreview,
    lastMessageTime: params.lastMessageTime,
    unreadCount: params.unreadCount ?? 0,
    isPinned: params.isPinned ?? false,
    isMuted: params.isMuted ?? false,
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
  };
}

export function isPrivateChat(room: ChatRoom): boolean {
  return room.type === 'private';
}

export function isGroupChat(room: ChatRoom): boolean {
  return room.type === 'group';
}