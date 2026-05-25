// Hook: useChat
// UI layer hook — calls ChatService driving port

import { useCallback, useEffect } from 'react';
import { useChatStore } from '../../infrastructure/stores/chat-store';
import { chatService } from '../../infrastructure/ioc/container';
import { useAuthStore } from '../../infrastructure/stores/auth-store';

export function useChat() {
  const {
    currentChatRoomId,
    messages,
    chatRooms,
    currentPage,
    hasMore,
    isLoadingMessages,
    isWsConnected,
    setCurrentChatRoom,
    setMessages,
    prependMessages,
    appendMessage,
    updateMessageStatus,
    setChatRooms,
    setCurrentPage,
    setHasMore,
    setLoadingMessages,
    setWsConnected,
    reset,
  } = useChatStore();

  const { user } = useAuthStore();

  // Connect WebSocket on mount
  useEffect(() => {
    chatService.connectWebSocket().then(() => {
      setWsConnected(true);
    });

    const unsubscribe = chatService.onMessageReceived((message) => {
      appendMessage(message);
      if (message.status === 'sending') {
        updateMessageStatus(message.id, 'sent');
      }
    });

    return () => {
      unsubscribe();
      chatService.disconnectWebSocket();
      setWsConnected(false);
    };
  }, [appendMessage, updateMessageStatus, setWsConnected]);

  const loadChatRooms = useCallback(async () => {
    const rooms = await chatService.getChatRooms();
    setChatRooms(rooms);
    return rooms;
  }, [setChatRooms]);

  const loadMessages = useCallback(async (chatRoomId: string, page = 1) => {
    setLoadingMessages(true);
    try {
      const msgs = await chatService.getMessages(chatRoomId, page, 20);
      if (page === 1) {
        setMessages(msgs);
      } else {
        prependMessages(msgs);
      }
      setCurrentPage(page);
      setHasMore(msgs.length === 20);
    } finally {
      setLoadingMessages(false);
    }
  }, [setMessages, prependMessages, setCurrentPage, setHasMore, setLoadingMessages]);

  const loadMore = useCallback(async () => {
    if (!currentChatRoomId || !hasMore || isLoadingMessages) return;
    await loadMessages(currentChatRoomId, currentPage + 1);
  }, [currentChatRoomId, currentPage, hasMore, isLoadingMessages, loadMessages]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' | 'code' = 'text') => {
    if (!currentChatRoomId) return;
    const message = await chatService.sendMessage(currentChatRoomId, content, type);
    appendMessage(message);
    return message;
  }, [currentChatRoomId, appendMessage]);

  const createChatRoom = useCallback(async (type: 'private' | 'group', name: string, memberIds: string[] = []) => {
    const room = await chatService.createChatRoom(type, name, memberIds);
    setChatRooms([room, ...chatRooms]);
    return room;
  }, [chatRooms, setChatRooms]);

  const selectChatRoom = useCallback(async (chatRoomId: string) => {
    setCurrentChatRoom(chatRoomId);
    await loadMessages(chatRoomId, 1);
  }, [setCurrentChatRoom, loadMessages]);

  return {
    currentChatRoomId,
    messages,
    chatRooms,
    currentPage,
    hasMore,
    isLoadingMessages,
    isWsConnected,
    user,
    loadChatRooms,
    loadMessages,
    loadMore,
    sendMessage,
    createChatRoom,
    selectChatRoom,
    setCurrentChatRoom: (id: string | null) => setCurrentChatRoom(id),
    reset,
  };
}
