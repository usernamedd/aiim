// Infrastructure: IoC Container
// Binds Port interfaces to concrete Adapter implementations
// Use Cases receive dependencies via constructor injection

import type { AuthGateway } from '../../application/ports/driven/AuthGateway';
import type { UserRepository } from '../../application/ports/driven/UserRepository';
import type { MessageRepository } from '../../application/ports/driven/MessageRepository';
import type { ChatRoomRepository } from '../../application/ports/driven/ChatRoomRepository';
import type { ContactRepository } from '../../application/ports/driven/ContactRepository';
import type { WebSocketPort } from '../../application/ports/driven/WebSocketPort';

import type { AuthService } from '../../application/ports/driving/AuthService';
import type { ChatService } from '../../application/ports/driving/ChatService';
import type { Contact } from '../../domain/entities/Contact';

import { RestAuthGateway } from '../../adapters/driven/api/RestAuthGateway';
import { RestUserRepository } from '../../adapters/driven/api/RestUserRepository';
import { RestChatRoomRepository } from '../../adapters/driven/api/RestChatRoomRepository';
import { RestMessageRepository } from '../../adapters/driven/api/RestMessageRepository';
import { RestContactRepository } from '../../adapters/driven/api/RestContactRepository';
import { WsMessageAdapter } from '../../adapters/driven/websocket/WsMessageAdapter';
import { LocalStorageAdapter } from '../../adapters/driven/storage/LocalStorageAdapter';

import { RegisterUseCase, RefreshTokenUseCase } from '../../application/use-cases/auth';
import { SendMessageUseCase, LoadMessagesUseCase, CreateChatRoomUseCase, MarkMessageReadUseCase } from '../../application/use-cases/chat';

// Singleton instances
const storage = new LocalStorageAdapter();
const authGateway: AuthGateway = new RestAuthGateway();
const userRepository: UserRepository = new RestUserRepository();
const chatRoomRepository: ChatRoomRepository = new RestChatRoomRepository();
const messageRepository: MessageRepository = new RestMessageRepository();
const contactRepository: ContactRepository = new RestContactRepository();
const webSocketPort: WebSocketPort = new WsMessageAdapter();

// Current user state
let _currentUserId: string = '';
let _authToken: string = '';

function syncTokenToAdapters(token: string, userId: string) {
  _authToken = token;
  _currentUserId = userId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (userRepository as any).setToken?.(token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (chatRoomRepository as any).setToken?.(token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (messageRepository as any).setToken?.(token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (contactRepository as any).setToken?.(token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (contactRepository as any).setCurrentUserId?.(userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (webSocketPort as any).setToken?.(token);
}

// Use Cases
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const registerUseCase = new RegisterUseCase(authGateway, userRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(authGateway);
const sendMessageUseCase = new SendMessageUseCase(messageRepository, webSocketPort, chatRoomRepository);
const loadMessagesUseCase = new LoadMessagesUseCase(messageRepository);
const createChatRoomUseCase = new CreateChatRoomUseCase(chatRoomRepository);
const markMessageReadUseCase = new MarkMessageReadUseCase(messageRepository);

// Driving ports (services used by UI)
export const authService: AuthService = {
  login: async (credentials) => {
    const { token, user } = await authGateway.login(credentials);
    syncTokenToAdapters(token.accessToken, user.id);
    return { token, user };
  },
  register: (params) => registerUseCase.execute(params).then(r => ({ token: r.token, user: r.user })),
  logout: () => {
    _authToken = '';
    _currentUserId = '';
    return authGateway.logout();
  },
  refreshToken: () => refreshTokenUseCase.execute(_authToken),
  getCurrentUser: () => userRepository.findById(_currentUserId),
  isAuthenticated: () => Promise.resolve(storage.get('token') !== null),
};

export const chatService: ChatService = {
  getChatRooms: () => chatRoomRepository.findAll(),
  getChatRoom: (id) => chatRoomRepository.findById(id),
  createChatRoom: (type, name, memberIds) =>
    createChatRoomUseCase.execute({ type, name, ownerId: _currentUserId, memberIds }).then(r => r.chatRoom),
  getMessages: (chatRoomId, page, pageSize) =>
    loadMessagesUseCase.execute({ chatRoomId, page, pageSize }).then(r => r.messages),
  sendMessage: (chatRoomId, content, type) =>
    sendMessageUseCase.execute({ chatRoomId, senderId: _currentUserId, content, type }).then(r => r.message),
  markAsRead: (chatRoomId, messageId) =>
    markMessageReadUseCase.execute({ messageId, userId: _currentUserId, chatRoomId }).then(() => {}),
  connectWebSocket: () => webSocketPort.connect(),
  disconnectWebSocket: () => webSocketPort.disconnect(),
  onMessageReceived: (cb) => webSocketPort.onMessage(cb),
  getContacts: (query?: string) =>
    query ? contactRepository.search(query) : contactRepository.findAll(),
  addContact: (username: string) => {
    return contactRepository.search(username).then(contacts => {
      const found = contacts.find(c => c.username === username);
      if (found) return contactRepository.save(found);
      const temp: Contact = {
        id: `temp-${Date.now()}`,
        userId: _currentUserId,
        friendId: '',
        username,
        nickname: username,
        isOnline: false,
        isBlocked: false,
        createdAt: new Date(),
      };
      return contactRepository.save(temp);
    });
  },
  removeContact: (contactId: string) => contactRepository.remove(contactId),
};

// Re-export for direct access
export { storage, authGateway, userRepository, chatRoomRepository, messageRepository, contactRepository, webSocketPort };
