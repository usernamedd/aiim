// Domain Entity: Contact
// Pure domain object with no external dependencies

import type { UserId } from './User';

export interface Contact {
  readonly id: string;
  readonly userId: UserId;
  readonly friendId: UserId;
  readonly remark?: string;
  readonly tags?: string[];
  readonly isBlocked: boolean;
  readonly createdAt: Date;
}

export function createContact(params: {
  id?: string;
  userId: UserId;
  friendId: UserId;
  remark?: string;
  tags?: string[];
  isBlocked?: boolean;
  createdAt?: Date;
}): Contact {
  return {
    id: params.id ?? `${params.userId}-${params.friendId}`,
    userId: params.userId,
    friendId: params.friendId,
    remark: params.remark,
    tags: params.tags,
    isBlocked: params.isBlocked ?? false,
    createdAt: params.createdAt ?? new Date(),
  };
}