package inbound

import (
	"context"

	"aiim/internal/domain/model"
)

// MessageCommandPort 消息命令端口（handler → service）
type MessageCommandPort interface {
	// CreateDirectChat 创建私聊
	CreateDirectChat(ctx context.Context, userID1, userID2 string) (*model.Chat, error)

	// CreateGroup 创建群聊
	CreateGroup(ctx context.Context, name, ownerID string, memberIDs []string) (*model.Chat, error)

	// UpdateGroupInfo 更新群聊信息
	UpdateGroupInfo(ctx context.Context, chatID, ownerID, name, avatarURL string) (*model.Chat, error)

	// SendMessage 发送消息
	SendMessage(ctx context.Context, chatID, senderID string, content model.MessageContent) (*model.Message, error)

	// MarkAsRead 标记消息已读
	MarkAsRead(ctx context.Context, userID, chatID string, messageID string) error

	// DeleteMessage 删除消息（仅发送者）
	DeleteMessage(ctx context.Context, userID, messageID string) error

	// RecallMessage 撤回消息（时间窗口内）
	RecallMessage(ctx context.Context, userID, messageID string) error

	// GetMessages 获取聊天室消息历史（分页）
	GetMessages(ctx context.Context, chatID string, beforeID string, limit int) ([]*model.Message, error)

	// GetUnreadCount 获取未读消息数
	GetUnreadCount(ctx context.Context, userID, chatID string) (int, error)

	// GetRecentChats 获取最近聊天室列表
	GetRecentChats(ctx context.Context, userID string, limit int) ([]*ChatPreview, error)

	// SearchChats 搜索聊天室
	SearchChats(ctx context.Context, keyword string, limit int) ([]*model.Chat, error)

	// GetChatDetail 获取聊天室详情（含成员）
	GetChatDetail(ctx context.Context, chatID, userID string) (*model.Chat, []*model.User, error)

	// AddMembers 批量添加成员（需群主/管理员权限）
	AddMembers(ctx context.Context, chatID, operatorID string, memberIDs []string) error

	// RemoveMember 移除成员（需群主/管理员权限）
	RemoveMember(ctx context.Context, chatID, operatorID, targetID string) error

	// LeaveGroup 主动退出群聊
	LeaveGroup(ctx context.Context, chatID, userID string) error
}

// MessageQueryPort 消息查询端口（只读）
type MessageQueryPort interface {
	// GetMessages 获取聊天室消息历史（分页）
	GetMessages(ctx context.Context, chatID string, beforeID string, limit int) ([]*model.Message, error)

	// GetUnreadCount 获取未读消息数
	GetUnreadCount(ctx context.Context, userID, chatID string) (int, error)

	// GetRecentChats 获取最近聊天室列表
	GetRecentChats(ctx context.Context, userID string, limit int) ([]*ChatPreview, error)

	// SearchChats 搜索聊天室
	SearchChats(ctx context.Context, keyword string, limit int) ([]*model.Chat, error)

	// GetChatDetail 获取聊天室详情（含成员）
	GetChatDetail(ctx context.Context, chatID, userID string) (*model.Chat, []*model.User, error)
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