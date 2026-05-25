// Hook: useChat
// UI layer hook — calls ChatService driving port

import { useCallback, useEffect } from 'react';
import { useChatStore } from '../../infrastructure/stores/chat-store';
import { chatService } from '../../infrastructure/ioc/container';
import type { Contact } from '../../domain/entities/Contact';
import type { ChatRoom } from '../../domain/entities/ChatRoom';

export function useChat() {
  const {
    currentChatRoomId,
    messages,
    chatRooms,
    contacts,
    isLoadingContacts,
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
    addChatRoom,
    setContacts,
    setCurrentPage,
    setHasMore,
    setLoadingMessages,
    setWsConnected,
    reset,
  } = useChatStore();

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

  const loadContacts = useCallback(async () => {
    const contactList = await chatService.getContacts();
    setContacts(contactList);
    return contactList;
  }, [setContacts]);

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

  const addContact = useCallback(async (username: string): Promise<Contact> => {
    const contact = await chatService.addContact(username);
    setContacts([...contacts, contact]);
    return contact;
  }, [contacts, setContacts]);

  const createGroup = useCallback(async (name: string, memberIds: string[]): Promise<ChatRoom> => {
    const room = await chatService.createChatRoom('group', name, memberIds);
    addChatRoom(room);
    return room;
  }, [addChatRoom]);

  const selectChatRoom = useCallback(async (chatRoomId: string) => {
    setCurrentChatRoom(chatRoomId);
    await loadMessages(chatRoomId, 1);
  }, [setCurrentChatRoom, loadMessages]);

  return {
    currentChatRoomId,
    messages,
    chatRooms,
    contacts,
    isLoadingContacts,
    currentPage,
    hasMore,
    isLoadingMessages,
    isWsConnected,
    loadChatRooms,
    loadContacts,
    loadMessages,
    loadMore,
    sendMessage,
    createChatRoom,
    addContact,
    createGroup,
    selectChatRoom,
    setCurrentChatRoom: (id: string | null) => setCurrentChatRoom(id),
    reset,
  };
}