// Adapter: WebSocket Message Adapter (Mock Implementation)
// Simulates WebSocket — replace with real WebSocket in production

import type { WebSocketPort } from '../../../application/ports/driven/WebSocketPort';
import type { Message } from '../../../domain/entities/Message';

type MessageCallback = (message: Message) => void;
type StatusCallback = () => void;

export class WsMessageAdapter implements WebSocketPort {
  private messageCallbacks: MessageCallback[] = [];
  private connectCallbacks: StatusCallback[] = [];
  private disconnectCallbacks: StatusCallback[] = [];
  private _isConnected = false;

  isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    // Mock: simulate connection
    await new Promise(resolve => setTimeout(resolve, 300));
    this._isConnected = true;
    this.connectCallbacks.forEach(cb => cb());
  }

  disconnect(): void {
    this._isConnected = false;
    this.disconnectCallbacks.forEach(cb => cb());
  }

  send(data: unknown): void {
    if (!this._isConnected) {
      throw new Error('WebSocket not connected');
    }
    // Mock: echo back the message after a short delay
    console.log('[WsMessageAdapter] Sending:', data);
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnect(callback: StatusCallback): () => void {
    this.connectCallbacks.push(callback);
    return () => {
      this.connectCallbacks = this.connectCallbacks.filter(cb => cb !== callback);
    };
  }

  onDisconnect(callback: StatusCallback): () => void {
    this.disconnectCallbacks.push(callback);
    return () => {
      this.disconnectCallbacks = this.disconnectCallbacks.filter(cb => cb !== callback);
    };
  }

  // Helper for testing: simulate receiving a message
  simulateMessage(message: Message): void {
    this.messageCallbacks.forEach(cb => cb(message));
  }
}
