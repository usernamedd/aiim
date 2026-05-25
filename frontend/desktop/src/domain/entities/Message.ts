// Domain Entity: Message
// Pure domain object with no external dependencies

import type { UserId } from './User';

export type MessageId = string;

export type MessageType = 'text' | 'image' | 'file' | 'code';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  readonly id: MessageId;
  readonly chatRoomId: string;
  readonly senderId: UserId;
  readonly type: MessageType;
  readonly content: string;
  readonly fileUrl?: string;
  readonly fileName?: string;
  readonly fileSize?: number;
  readonly codeLanguage?: string;
  readonly status: MessageStatus;
  readonly replyToId?: MessageId;
  readonly createdAt: Date;
}

export function createMessage(params: {
  id: MessageId;
  chatRoomId: string;
  senderId: UserId;
  type: MessageType;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  codeLanguage?: string;
  status?: MessageStatus;
  replyToId?: MessageId;
  createdAt?: Date;
}): Message {
  return {
    id: params.id,
    chatRoomId: params.chatRoomId,
    senderId: params.senderId,
    type: params.type,
    content: params.content,
    fileUrl: params.fileUrl,
    fileName: params.fileName,
    fileSize: params.fileSize,
    codeLanguage: params.codeLanguage,
    status: params.status ?? 'sending',
    replyToId: params.replyToId,
    createdAt: params.createdAt ?? new Date(),
  };
}

export function isTextMessage(msg: Message): boolean {
  return msg.type === 'text';
}

export function isImageMessage(msg: Message): boolean {
  return msg.type === 'image';
}

export function isFileMessage(msg: Message): boolean {
  return msg.type === 'file';
}

export function isCodeMessage(msg: Message): boolean {
  return msg.type === 'code';
}