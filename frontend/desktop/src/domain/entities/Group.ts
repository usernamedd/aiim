// Domain Entity: Group
// Pure domain object with no external dependencies

import type { UserId } from './User';

export interface Group {
  readonly id: string;
  readonly name: string;
  readonly avatar?: string;
  readonly ownerId: UserId;
  readonly adminIds: UserId[];
  readonly memberIds: UserId[];
  readonly memberCount: number;
  readonly description?: string;
  readonly createdAt: Date;
}

export function createGroup(params: {
  id: string;
  name: string;
  avatar?: string;
  ownerId: UserId;
  adminIds?: UserId[];
  memberIds?: UserId[];
  memberCount?: number;
  description?: string;
  createdAt?: Date;
}): Group {
  return {
    id: params.id,
    name: params.name,
    avatar: params.avatar,
    ownerId: params.ownerId,
    adminIds: params.adminIds ?? [],
    memberIds: params.memberIds ?? [],
    memberCount: params.memberCount ?? params.memberIds?.length ?? 0,
    description: params.description,
    createdAt: params.createdAt ?? new Date(),
  };
}