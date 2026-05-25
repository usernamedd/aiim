// Driven Port: WebSocket Port
// Implemented by adapters for real-time communication

import type { Message } from '../../../domain/entities/Message';

export interface WebSocketPort {
  connect(): Promise<void>;
  disconnect(): void;
  send(data: unknown): void;
  onMessage(callback: (message: Message) => void): () => void;
  onConnect(callback: () => void): () => void;
  onDisconnect(callback: () => void): () => void;
  isConnected(): boolean;
}
