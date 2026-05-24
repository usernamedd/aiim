package inbound

import (
	"context"

	"aiim/internal/domain/model"
)

// MessageCommandPort 消息命令端口（handler → service）
type MessageCommandPort interface {
	// SendMessage 发送消息
	SendMessage(ctx context.Context, chatID, senderID string, content model.MessageContent) (*model.Message, error)

	// MarkAsRead 标记消息已读
	MarkAsRead(ctx context.Context, userID, chatID string, messageID string) error

	// DeleteMessage 删除消息（仅发送者）
	DeleteMessage(ctx context.Context, userID, messageID string) error

	// RecallMessage 撤回消息（时间窗口内）
	RecallMessage(ctx context.Context, userID, messageID string) error
}

// MessageQueryPort 消息查询端口（只读）
type MessageQueryPort interface {
	// GetMessages 获取聊天室消息历史（分页）
	GetMessages(ctx context.Context, chatID string, beforeID string, limit int) ([]*model.Message, error)

	// GetUnreadCount 获取未读消息数
	GetUnreadCount(ctx context.Context, userID, chatID string) (int, error)

	// GetRecentChats 获取最近聊天室列表
	GetRecentChats(ctx context.Context, userID string, limit int) ([]*ChatPreview, error)
}

// ChatPreview 聊天室预览（列表用）
type ChatPreview struct {
	Chat       *model.Chat
	LastMsg    *model.Message
	Unread     int
	Members    []*model.User
}

// --- 错误映射 ---
// ErrChatNotFound → HTTP 404
// ErrNotChatMember → HTTP 403
// ErrNotAuthorized → HTTP 403
// ErrMessageNotFound → HTTP 404
// errors.ErrNotAuthorized → HTTP 403