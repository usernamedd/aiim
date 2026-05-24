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
	Type    ContentType `json:"type"`    // text/image/file/code
	Text    string      `json:"text"`    // 文本内容
	Url     string      `json:"url"`     // 资源 URL
	MimeType string     `json:"mime"`    // MIME 类型
	Size    int64       `json:"size"`    // 文件大小
}

// ContentType 内容类型
type ContentType string

const (
	ContentTypeText   ContentType = "text"
	ContentTypeImage ContentType = "image"
	ContentTypeFile  ContentType = "file"
	ContentTypeCode  ContentType = "code"
)

// MessageStatus 消息状态
type MessageStatus string

const (
	MessageStatusSent      MessageStatus = "sent"
	MessageStatusDelivered MessageStatus = "delivered"
	MessageStatusRead      MessageStatus = "read"
)