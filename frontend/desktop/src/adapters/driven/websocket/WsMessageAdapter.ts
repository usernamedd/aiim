// Adapter: WebSocket Message Adapter (Real Implementation)
// Connects to Go backend WebSocket at ws://localhost:8080/api/v1/ws

import type { WebSocketPort } from '../../../application/ports/driven/WebSocketPort';
import type { Message, MessageType } from '../../../domain/entities/Message';
import { createMessage } from '../../../domain/entities/Message';

type MessageCallback = (message: Message) => void;
type StatusCallback = () => void;
type AckCallback = (clientMsgId: string, serverMsgId: string) => void;
type ReadCallback = (chatId: string, userId: string, messageId: string) => void;
type PresenceCallback = (userId: string, online: boolean) => void;

interface WSServerMessage {
  type: string;
  payload: Record<string, unknown>;
}

interface WSMessagePayload {
  ID: string;
  ChatID: string;
  SenderID: string;
  Content: {
    Type: string;
    Text: string;
    Url?: string;
    Mime?: string;
    Size?: number;
    Thumb?: string;
    Duration?: number;
    Width?: number;
    Height?: number;
  };
  Status: string;
  CreatedAt: string;
}

export class WsMessageAdapter implements WebSocketPort {
  private ws: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private connectCallbacks: StatusCallback[] = [];
  private disconnectCallbacks: StatusCallback[] = [];
  private ackCallbacks: AckCallback[] = [];
  private readCallbacks: ReadCallback[] = [];
  private presenceCallbacks: PresenceCallback[] = [];
  private _isConnected = false;
  private token = '';
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private shouldReconnect = false;

  isConnected(): boolean {
    return this._isConnected;
  }

  setToken(token: string): void {
    this.token = token;
  }

  async connect(token?: string): Promise<void> {
    if (token) this.token = token;
    if (!this.token) throw new Error('No token available for WS connection');

    return new Promise((resolve, reject) => {
      const url = `ws://localhost:8080/api/v1/ws?token=${encodeURIComponent(this.token)}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this._isConnected = true;
        this.reconnectAttempts = 0;
        this.startPing();
        this.connectCallbacks.forEach(cb => cb());
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.warn('[WsMessageAdapter] Failed to parse message:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn('[WsMessageAdapter] WS error:', e);
      };

      this.ws.onclose = () => {
        this._isConnected = false;
        this.stopPing();
        this.disconnectCallbacks.forEach(cb => cb());
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      // Connection timeout
      setTimeout(() => {
        if (!this._isConnected) {
          this.ws?.close();
          reject(new Error('WS connection timeout'));
        }
      }, 10000);
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._isConnected = false;
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.sendRaw({ type: 'ping', payload: {} });
    }, 25000); // ping every 25s (backend expects 30s)
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect().catch(() => { });
      }
    }, delay);
  }

  private sendRaw(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  send(data: unknown): void {
    if (!this._isConnected) throw new Error('WebSocket not connected');
    const msg = data as { type?: string; payload?: Record<string, unknown> };
    this.sendRaw({ type: msg.type || 'send_message', payload: msg.payload || data });
  }

  sendMessage(text: string, chatId: string, clientMsgId: string): void {
    this.sendRaw({
      type: 'send_message',
      payload: { text, chat_id: chatId, client_msg_id: clientMsgId },
    });
  }

  markRead(chatId: string, messageId: string): void {
    this.sendRaw({
      type: 'mark_read',
      payload: { chat_id: chatId, message_id: messageId },
    });
  }

  private handleMessage(msg: WSServerMessage): void {
    switch (msg.type) {
      case 'message': {
        const p = msg.payload as unknown as WSMessagePayload;
        const message = this.mapToMessage(p);
        this.messageCallbacks.forEach(cb => cb(message));
        break;
      }
      case 'ack': {
        const p = msg.payload as { client_msg_id: string; server_msg_id: string };
        this.ackCallbacks.forEach(cb => cb(p.client_msg_id, p.server_msg_id));
        break;
      }
      case 'presence': {
        const p = msg.payload as { user_id: string; online: boolean };
        this.presenceCallbacks.forEach(cb => cb(p.user_id, p.online));
        break;
      }
      case 'message_read': {
        const p = msg.payload as { chat_id: string; user_id: string; message_id: string };
        this.readCallbacks.forEach(cb => cb(p.chat_id, p.user_id, p.message_id));
        break;
      }
      case 'member_joined':
      case 'member_left':
 // Group events — handled by upper layer if needed
        break;
      case 'pong':
        // Server responded to our ping — no action needed
        break;
      case 'error': {
        const p = msg.payload as { message: string };
        console.warn('[WsMessageAdapter] Server error:', p.message);
        break;
      }
    }
  }

  private mapToMessage(p: WSMessagePayload): Message {
    const type = p.Content.Type as MessageType;
    return createMessage({
      id: p.ID,
      chatRoomId: p.ChatID,
      senderId: p.SenderID,
      type,
      content: p.Content.Text || '',
      fileUrl: p.Content.Url,
      fileSize: p.Content.Size,
      status: (p.Status as Message['status']) || 'sent',
      createdAt: new Date(p.CreatedAt),
    });
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

  onAck(callback: AckCallback): () => void {
    this.ackCallbacks.push(callback);
    return () => {
      this.ackCallbacks = this.ackCallbacks.filter(cb => cb !== callback);
    };
  }

  onRead(callback: ReadCallback): () => void {
    this.readCallbacks.push(callback);
    return () => {
      this.readCallbacks = this.readCallbacks.filter(cb => cb !== callback);
    };
  }

  onPresence(callback: PresenceCallback): () => void {
    this.presenceCallbacks.push(callback);
    return () => {
      this.presenceCallbacks = this.presenceCallbacks.filter(cb => cb !== callback);
    };
  }
}
