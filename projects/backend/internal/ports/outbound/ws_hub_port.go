package outbound

// WSHubPort WebSocket Hub 端口
type WSHubPort interface {
	Register(conn Conn, userID string)
	Unregister(conn Conn, userID string)
	SendToUser(userID string, msg WSMessage) error
	SendToUsers(userIDs []string, msg WSMessage) error
	Broadcast(msg WSMessage)
	BroadcastToChat(chatID string, msg WSMessage) error
	IsUserOnline(userID string) bool
	GetOnlineUsers() []string
}

// Conn WebSocket 连接抽象接口
type Conn interface {
	WriteMessage(msg WSMessage) error
	Close()
	UserID() string
}

// WSMessage WebSocket 消息结构
type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

const (
	WSMsgTypeMessage      = "message"
	WSMsgTypePresence     = "presence"
	WSMsgTypeAck          = "ack"
	WSMsgTypeError        = "error"
	WSMsgTypePing         = "ping"
	WSMsgTypePong         = "pong"
	WSMsgTypeMemberJoined = "member_joined"
	WSMsgTypeMemberLeft   = "member_left"
	WSMsgTypeMessageRead  = "message_read"
)