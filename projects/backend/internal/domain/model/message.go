package model

import "time"

// Message 消息模型
type Message struct {
	ID        string        // UUID
	ChatID    string        // 外键→Chat.ID
	SenderID  string        // 发送者 User.ID
	Content   MessageContent // 消息内容（文本/图片等）
	Status    MessageStatus  // sent/delivered/read
	CreatedAt time.Time
}

// MessageContent 消息内容（支持多种类型）
type MessageContent struct {
	Type        ContentType `json:"type"`     // text/image/file/code/voice
	Text        string      `json:"text"`     // 文本内容
	Url         string      `json:"url"`      // 资源 URL
	MimeType    string      `json:"mime"`     // MIME 类型
	Size        int64       `json:"size"`     // 文件大小（字节）
	ThumbnailUrl string    `json:"thumb"`    // 缩略图 URL（图片用）
	Duration    int         `json:"duration"` // 时长（语音/视频，秒）
	Width       int         `json:"width"`    // 图片宽度
	Height      int         `json:"height"`   // 图片高度
}

// ContentType 内容类型
type ContentType string

const (
	ContentTypeText   ContentType = "text"
	ContentTypeImage ContentType = "image"
	ContentTypeFile  ContentType = "file"
	ContentTypeCode  ContentType = "code"
	ContentTypeVoice ContentType = "voice"
)

// MessageStatus 消息状态
type MessageStatus string

const (
	MessageStatusSent      MessageStatus = "sent"
	MessageStatusDelivered MessageStatus = "delivered"
	MessageStatusRead      MessageStatus = "read"
)

// WSMessage WebSocket 消息结构
type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// --- WebSocket 消息类型常量 ---
const (
	WSMsgTypeMessage   = "message"
	WSMsgTypePresence  = "presence"
	WSMsgTypeAck       = "ack"
	WSMsgTypeError     = "error"
	WSMsgTypePing      = "ping"
	WSMsgTypePong      = "pong"
)