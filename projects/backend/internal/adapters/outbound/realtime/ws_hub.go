package realtime

import (
	"sync"

	"aiim/internal/ports/outbound"
)

// WSHub WebSocket Hub 实现
type WSHub struct {
	mu      sync.RWMutex
	clients map[string]outbound.Conn
}

func NewWSHub() *WSHub {
	return &WSHub{clients: make(map[string]outbound.Conn)}
}

func (h *WSHub) Register(conn outbound.Conn, userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[userID] = conn
}

func (h *WSHub) Unregister(conn outbound.Conn, userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, userID)
}

func (h *WSHub) SendToUser(userID string, msg outbound.WSMessage) error {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if conn, ok := h.clients[userID]; ok {
		return conn.WriteMessage(msg)
	}
	return nil
}

func (h *WSHub) SendToUsers(userIDs []string, msg outbound.WSMessage) error {
	for _, id := range userIDs {
		_ = h.SendToUser(id, msg)
	}
	return nil
}

func (h *WSHub) Broadcast(msg outbound.WSMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, conn := range h.clients {
		_ = conn.WriteMessage(msg)
	}
}

func (h *WSHub) IsUserOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.clients[userID]
	return ok
}

func (h *WSHub) GetOnlineUsers() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	users := make([]string, 0, len(h.clients))
	for id := range h.clients {
		users = append(users, id)
	}
	return users
}