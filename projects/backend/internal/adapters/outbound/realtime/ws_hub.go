package realtime

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"aiim/internal/ports/outbound"

	"github.com/gorilla/websocket"
)

const (
	pongWait     = 60 * time.Second
	pingInterval = 30 * time.Second
	writeWait    = 10 * time.Second
)

// Conn WebSocket 连接（实现 outbound.Conn 接口）
type Conn struct {
	conn   *websocket.Conn
	userID string
	send   chan []byte
	closed bool
	mu     sync.Mutex
}

func NewConn(conn *websocket.Conn, userID string) *Conn {
	return &Conn{
		conn:   conn,
		userID: userID,
		send:   make(chan []byte, 256),
	}
}

func (c *Conn) WriteMessage(msg outbound.WSMessage) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.closed {
		return nil
	}
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, data)
}

func (c *Conn) Close() {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.closed {
		return
	}
	c.closed = true
	close(c.send)
	c.conn.Close()
}

func (c *Conn) UserID() string {
	return c.userID
}

// ReadPump 从 WebSocket 读取消息
func (c *Conn) ReadPump(onMessage func([]byte)) {
	defer func() {
		c.Close()
		onMessage(nil)
	}()

	c.conn.SetReadLimit(65536)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			return
		}
		onMessage(message)
	}
}

// WritePump 写入消息 + 自动 ping
func (c *Conn) WritePump() {
	ticker := time.NewTicker(pingInterval)
	defer ticker.Stop()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// WSHub WebSocket Hub
type WSHub struct {
	mu               sync.RWMutex
	clients          map[string]map[*Conn]bool
	register         chan *Conn
	unregister       chan *Conn
	onPresence       func(userID string, online bool)
	onChatBroadcast func(chatID string, msg outbound.WSMessage)
}

func NewWSHub() *WSHub {
	return &WSHub{
		clients:   make(map[string]map[*Conn]bool),
		register:   make(chan *Conn),
		unregister: make(chan *Conn),
	}
}

// Run 事件循环（需在 goroutine 中运行）
func (h *WSHub) Run(ctx interface{ Done() <-chan struct{} }) {
	for {
		select {
		case <-ctx.Done():
			return
		case conn := <-h.register:
			h.mu.Lock()
			if h.clients[conn.userID] == nil {
				h.clients[conn.userID] = make(map[*Conn]bool)
			}
			h.clients[conn.userID][conn] = true
			isFirst := len(h.clients[conn.userID]) == 1
			h.mu.Unlock()
			if isFirst && h.onPresence != nil {
				h.onPresence(conn.userID, true)
			}
			log.Printf("[WSHub] 用户 %s 上线，设备数: %d", conn.userID, len(h.clients[conn.userID]))

		case conn := <-h.unregister:
			h.mu.Lock()
			if set, ok := h.clients[conn.userID]; ok {
				delete(set, conn)
				if len(set) == 0 {
					delete(h.clients, conn.userID)
				}
			}
			h.mu.Unlock()
			conn.Close()
			if !h.isUserOnline(conn.userID) && h.onPresence != nil {
				h.onPresence(conn.userID, false)
			}
			log.Printf("[WSHub] 用户 %s 离线", conn.userID)
		}
	}
}

func (h *WSHub) isUserOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients[userID]) > 0
}

// Register 注册连接
func (h *WSHub) Register(conn outbound.Conn, userID string) {
	if wc, ok := conn.(*Conn); ok {
		h.register <- wc
	}
}

// Unregister 注销连接
func (h *WSHub) Unregister(conn outbound.Conn, userID string) {
	if wc, ok := conn.(*Conn); ok {
		h.unregister <- wc
	}
}

// SendToUser 向用户所有连接发送
func (h *WSHub) SendToUser(userID string, msg outbound.WSMessage) error {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if set, ok := h.clients[userID]; ok {
		for conn := range set {
			data, _ := json.Marshal(msg)
			select {
			case conn.send <- data:
			default:
			}
		}
	}
	return nil
}

// SendToUsers 批量发送
func (h *WSHub) SendToUsers(userIDs []string, msg outbound.WSMessage) error {
	for _, id := range userIDs {
		h.SendToUser(id, msg)
	}
	return nil
}

// Broadcast 广播给所有在线用户
func (h *WSHub) Broadcast(msg outbound.WSMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	data, _ := json.Marshal(msg)
	for _, set := range h.clients {
		for conn := range set {
			select {
			case conn.send <- data:
			default:
			}
		}
	}
}

// BroadcastToChat 向聊天室成员广播
func (h *WSHub) BroadcastToChat(chatID string, msg outbound.WSMessage) error {
	// WSHub 不持有 chatRepo，无法解析成员
	// 改为通知上层（通过 onChatBroadcast 回调）
	if h.onChatBroadcast != nil {
		h.onChatBroadcast(chatID, msg)
	}
	return nil
}

// SetChatBroadcastHandler 设置聊天室广播回调
func (h *WSHub) SetChatBroadcastHandler(fn func(chatID string, msg outbound.WSMessage)) {
	h.onChatBroadcast = fn
}

// IsUserOnline 检查是否在线
func (h *WSHub) IsUserOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients[userID]) > 0
}

// GetOnlineUsers 获取所有在线用户
func (h *WSHub) GetOnlineUsers() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	users := make([]string, 0, len(h.clients))
	for id := range h.clients {
		users = append(users, id)
	}
	return users
}

// SetPresenceHandler 设置状态变更回调
func (h *WSHub) SetPresenceHandler(onPresence func(userID string, online bool)) {
	h.onPresence = onPresence
}