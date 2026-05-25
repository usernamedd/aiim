// Domain Entity: Contact
// Pure domain object with no external dependencies

import type { UserId } from './User';

export interface Contact {
  readonly id: string;
  readonly userId: UserId;
  readonly friendId: UserId;
  readonly username: string;        // Friend's username (for display/lookup)
  readonly nickname: string;       // Friend's display name
  readonly avatar?: string;       // Friend's avatar URL
  readonly remark?: string;        // User's remark for this contact
  readonly tags?: string[];       // User-defined tags
  readonly isBlocked: boolean;
  readonly isOnline?: boolean;     // Online status
  readonly lastMessageAt?: Date;  // Last message time
  readonly createdAt: Date;
}

export function createContact(params: {
  id?: string;
  userId: UserId;
  friendId: UserId;
  username: string;
  nickname: string;
  avatar?: string;
  remark?: string;
  tags?: string[];
  isBlocked?: boolean;
  isOnline?: boolean;
  lastMessageAt?: Date;
  createdAt?: Date;
}): Contact {
  return {
    id: params.id ?? `${params.userId}-${params.friendId}`,
    userId: params.userId,
    friendId: params.friendId,
    username: params.username,
    nickname: params.nickname,
    avatar: params.avatar,
    remark: params.remark,
    tags: params.tags,
    isBlocked: params.isBlocked ?? false,
    isOnline: params.isOnline,
    lastMessageAt: params.lastMessageAt,
    createdAt: params.createdAt ?? new Date(),
  };
}