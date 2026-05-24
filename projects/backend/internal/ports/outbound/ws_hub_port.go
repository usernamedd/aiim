package outbound

// WSHubPort WebSocket Hub 端口
// 定义实时消息推送的标准接口，不依赖 gorilla/websocket
type WSHubPort interface {
	// Register 注册连接
	Register(conn Conn, userID string)

	// Unregister 注销连接
	Unregister(conn Conn, userID string)

	// SendToUser 向指定用户发送消息
	SendToUser(userID string, msg WSMessage) error

	// SendToUsers 批量发送（用于群聊广播）
	SendToUsers(userIDs []string, msg WSMessage) error

	// Broadcast 广播给所有在线用户
	Broadcast(msg WSMessage)

	// IsUserOnline 检查用户是否在线
	IsUserOnline(userID string) bool

	// GetOnlineUsers 获取所有在线用户
	GetOnlineUsers() []string
}

// Conn WebSocket 连接抽象接口
type Conn interface {
	// WriteMessage 发送消息
	WriteMessage(msg WSMessage) error

	// Close 关闭连接
	Close()

	// UserID 获取用户 ID
	UserID() string
}

// WSMessage WebSocket 消息结构
type WSMessage struct {
	Type    string      `json:"type"`    // message/presence/error
	Payload interface{} `json:"payload"` // 消息内容
}

// --- 消息类型常量 ---
const (
	WSMsgTypeMessage   = "message"    // 新消息
	WSMsgTypePresence  = "presence"   // 用户状态变更
	WSMsgTypeAck       = "ack"        // 消息已收到
	WSMsgTypeError     = "error"      // 错误
	WSMsgTypePing      = "ping"       // 心跳
	WSMsgTypePong      = "pong"       // 心跳响应
)