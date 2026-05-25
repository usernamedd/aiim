// Infrastructure: IoC Container
// Binds Port interfaces to concrete Adapter implementations
// Use Cases receive dependencies via constructor injection

import type { AuthGateway } from '../../application/ports/driven/AuthGateway';
import type { UserRepository } from '../../application/ports/driven/UserRepository';
import type { MessageRepository } from '../../application/ports/driven/MessageRepository';
import type { ChatRoomRepository } from '../../application/ports/driven/ChatRoomRepository';
import type { WebSocketPort } from '../../application/ports/driven/WebSocketPort';

import type { AuthService } from '../../application/ports/driving/AuthService';
import type { ChatService } from '../../application/ports/driving/ChatService';

import { RestAuthGateway } from '../../adapters/driven/api/RestAuthGateway';
import { InMemoryUserRepository } from '../../adapters/driven/repository/InMemoryUserRepository';
import { InMemoryMessageRepository } from '../../adapters/driven/repository/InMemoryMessageRepository';
import { InMemoryChatRoomRepository } from '../../adapters/driven/repository/InMemoryChatRoomRepository';
import { WsMessageAdapter } from '../../adapters/driven/websocket/WsMessageAdapter';
import { LocalStorageAdapter } from '../../adapters/driven/storage/LocalStorageAdapter';

import { LoginUseCase, RegisterUseCase, RefreshTokenUseCase } from '../../application/use-cases/auth';
import { SendMessageUseCase, LoadMessagesUseCase, CreateChatRoomUseCase, MarkMessageReadUseCase } from '../../application/use-cases/chat';

// Singleton instances
const storage = new LocalStorageAdapter();
const authGateway: AuthGateway = new RestAuthGateway();
const userRepository: UserRepository = new InMemoryUserRepository();
const messageRepository: MessageRepository = new InMemoryMessageRepository();
const chatRoomRepository: ChatRoomRepository = new InMemoryChatRoomRepository();
const webSocketPort: WebSocketPort = new WsMessageAdapter();

// Use Cases
const loginUseCase = new LoginUseCase(authGateway, userRepository);
const registerUseCase = new RegisterUseCase(authGateway, userRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(authGateway);
const sendMessageUseCase = new SendMessageUseCase(messageRepository, webSocketPort, chatRoomRepository);
const loadMessagesUseCase = new LoadMessagesUseCase(messageRepository);
const createChatRoomUseCase = new CreateChatRoomUseCase(chatRoomRepository);
const markMessageReadUseCase = new MarkMessageReadUseCase(messageRepository);
// const addContactUseCase = new AddContactUseCase(userRepository);
// const createGroupUseCase = new CreateGroupUseCase(chatRoomRepository);

// Driving ports (services used by UI)
export const authService: AuthService = {
  login: (credentials) => loginUseCase.execute(credentials).then(r => ({ token: r.events[0] ? { accessToken: '', refreshToken: '', expiresAt: new Date() } : { accessToken: '', refreshToken: '', expiresAt: new Date() }, user: r.user })),
  register: (params) => registerUseCase.execute(params).then(r => ({ token: r.token, user: r.user })),
  logout: () => Promise.resolve(),
  refreshToken: () => refreshTokenUseCase.execute('mock'),
  getCurrentUser: () => userRepository.findAll().then(users => users[0] ?? null),
  isAuthenticated: () => Promise.resolve(storage.get('token') !== null),
};

export const chatService: ChatService = {
  getChatRooms: () => chatRoomRepository.findAll(),
  getChatRoom: (id) => chatRoomRepository.findById(id),
  createChatRoom: (type, name, memberIds) => createChatRoomUseCase.execute({ type, name, ownerId: 'current-user', memberIds }).then(r => r.chatRoom),
  getMessages: (chatRoomId, page, pageSize) => loadMessagesUseCase.execute({ chatRoomId, page, pageSize }).then(r => r.messages),
  sendMessage: (chatRoomId, content, type) => sendMessageUseCase.execute({ chatRoomId, senderId: 'current-user', content, type }).then(r => r.message),
  markAsRead: (chatRoomId, messageId) => markMessageReadUseCase.execute({ messageId, userId: 'current-user', chatRoomId }).then(() => {}),
  connectWebSocket: () => webSocketPort.connect(),
  disconnectWebSocket: () => webSocketPort.disconnect(),
  onMessageReceived: (cb) => webSocketPort.onMessage(cb),
};

// Re-export for direct access
export { storage, authGateway, userRepository, messageRepository, chatRoomRepository, webSocketPort };
