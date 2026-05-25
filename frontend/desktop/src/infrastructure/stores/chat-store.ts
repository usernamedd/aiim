// Infrastructure: Chat Store (Zustand)
// UI state only — no business logic

import { create } from 'zustand';
import type { ChatRoom, Message } from '../../domain/entities';

interface ChatState {
  // Current conversation
  currentChatRoomId: string | null;
  messages: Message[];
  chatRooms: ChatRoom[];
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  isLoadingMessages: boolean;
  
  // WebSocket status
  isWsConnected: boolean;
  
  // Actions
  setCurrentChatRoom: (chatRoomId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  prependMessages: (messages: Message[]) => void;
  appendMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  setChatRooms: (rooms: ChatRoom[]) => void;
  addChatRoom: (room: ChatRoom) => void;
  updateChatRoom: (room: ChatRoom) => void;
  setCurrentPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  setWsConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentChatRoomId: null,
  messages: [],
  chatRooms: [],
  currentPage: 1,
  hasMore: true,
  isLoadingMessages: false,
  isWsConnected: false,
  
  setCurrentChatRoom: (chatRoomId) => set({ currentChatRoomId: chatRoomId, messages: [], currentPage: 1 }),
  setMessages: (messages) => set({ messages }),
  prependMessages: (newMessages) => set((state) => ({ messages: [...newMessages, ...state.messages] })),
  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    })),
  setChatRooms: (chatRooms) => set({ chatRooms }),
  addChatRoom: (room) => set((state) => ({ chatRooms: [room, ...state.chatRooms] })),
  updateChatRoom: (room) =>
    set((state) => ({
      chatRooms: state.chatRooms.map((r) => (r.id === room.id ? room : r)),
    })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setHasMore: (hasMore) => set({ hasMore }),
  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
  setWsConnected: (connected) => set({ isWsConnected: connected }),
  reset: () =>
    set({
      currentChatRoomId: null,
      messages: [],
      chatRooms: [],
      currentPage: 1,
      hasMore: true,
      isLoadingMessages: false,
    }),
}));
