// ============================================================
// Domain Events
// Pure domain events — no external dependencies
// ============================================================

import type { UserId } from '../entities/User';
import type { MessageId, Message } from '../entities/Message';
import type { ChatRoomId } from '../entities/ChatRoom';

// Base event interface
export interface DomainEvent {
  readonly occurredAt: Date;
  readonly eventType: string;
}

// User Events
export interface UserLoggedInEvent extends DomainEvent {
  readonly eventType: 'UserLoggedIn';
  readonly userId: UserId;
  readonly username: string;
}

export interface UserLoggedOutEvent extends DomainEvent {
  readonly eventType: 'UserLoggedOut';
  readonly userId: UserId;
}

export interface UserRegisteredEvent extends DomainEvent {
  readonly eventType: 'UserRegistered';
  readonly userId: UserId;
  readonly username: string;
}

// Message Events
export interface MessageSentEvent extends DomainEvent {
  readonly eventType: 'MessageSent';
  readonly message: Message;
}

export interface MessageReceivedEvent extends DomainEvent {
  readonly eventType: 'MessageReceived';
  readonly message: Message;
  readonly chatRoomId: ChatRoomId;
}

export interface MessageReadEvent extends DomainEvent {
  readonly eventType: 'MessageRead';
  readonly messageId: MessageId;
  readonly userId: UserId;
  readonly chatRoomId: ChatRoomId;
}

// ChatRoom Events
export interface ChatRoomCreatedEvent extends DomainEvent {
  readonly eventType: 'ChatRoomCreated';
  readonly chatRoomId: ChatRoomId;
  readonly ownerId: UserId;
}

export interface ContactAddedEvent extends DomainEvent {
  readonly eventType: 'ContactAdded';
  readonly userId: UserId;
  readonly contactUserId: UserId;
}

// Event factory functions
export function createUserLoggedInEvent(userId: UserId, username: string): UserLoggedInEvent {
  return { eventType: 'UserLoggedIn', userId, username, occurredAt: new Date() };
}

export function createUserLoggedOutEvent(userId: UserId): UserLoggedOutEvent {
  return { eventType: 'UserLoggedOut', userId, occurredAt: new Date() };
}

export function createUserRegisteredEvent(userId: UserId, username: string): UserRegisteredEvent {
  return { eventType: 'UserRegistered', userId, username, occurredAt: new Date() };
}

export function createMessageSentEvent(message: Message): MessageSentEvent {
  return { eventType: 'MessageSent', message, occurredAt: new Date() };
}

export function createMessageReceivedEvent(message: Message, chatRoomId: ChatRoomId): MessageReceivedEvent {
  return { eventType: 'MessageReceived', message, chatRoomId, occurredAt: new Date() };
}

export function createMessageReadEvent(messageId: MessageId, userId: UserId, chatRoomId: ChatRoomId): MessageReadEvent {
  return { eventType: 'MessageRead', messageId, userId, chatRoomId, occurredAt: new Date() };
}

export function createChatRoomCreatedEvent(chatRoomId: ChatRoomId, ownerId: UserId): ChatRoomCreatedEvent {
  return { eventType: 'ChatRoomCreated', chatRoomId, ownerId, occurredAt: new Date() };
}

export function createContactAddedEvent(userId: UserId, contactUserId: UserId): ContactAddedEvent {
  return { eventType: 'ContactAdded', userId, contactUserId, occurredAt: new Date() };
}
