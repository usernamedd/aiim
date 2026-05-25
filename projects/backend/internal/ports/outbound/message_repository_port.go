package outbound

import (
	"context"

	"aiim/internal/domain/model"
)

// MessageRepositoryPort 消息仓储端口
type MessageRepositoryPort interface {
	// Save 保存消息
	Save(ctx context.Context, msg *model.Message) error

	// FindByID 查找消息
	FindByID(ctx context.Context, id string) (*model.Message, error)

	// FindByChatID 查找聊天室消息（分页）
	FindByChatID(ctx context.Context, chatID string, beforeID string, limit int) ([]*model.Message, error)

	// UpdateStatus 更新消息状态
	UpdateStatus(ctx context.Context, id string, status model.MessageStatus) error

	// Delete 删除消息
	Delete(ctx context.Context, id string) error

	// CountUnread 统计未读消息数
	CountUnread(ctx context.Context, userID, chatID string) (int, error)
}

// ChatRepositoryPort 聊天室仓储端口
type ChatRepositoryPort interface {
	// Save 创建或更新聊天室
	Save(ctx context.Context, chat *model.Chat) error

	// FindByID 查找聊天室
	FindByID(ctx context.Context, id string) (*model.Chat, error)

	// FindDirectChatByMembers 查找两人私聊
	FindDirectChatByMembers(ctx context.Context, userID1, userID2 string) (*model.Chat, error)

	// ListByUser 列出用户参与的聊天室
	ListByUser(ctx context.Context, userID string, limit int) ([]*model.Chat, error)

	// AddMember 添加成员
	AddMember(ctx context.Context, member *model.ChatMember) error

	// AddMembers 批量添加成员
	AddMembers(ctx context.Context, chatID string, memberIDs []string, role string) error

	// RemoveMember 移除成员
	RemoveMember(ctx context.Context, chatID, userID string) error

	// GetMembers 获取聊天室成员
	GetMembers(ctx context.Context, chatID string) ([]*model.User, error)

	// IsMember 检查是否是成员
	IsMember(ctx context.Context, chatID, userID string) (bool, error)

	// GetMemberRole 获取成员角色
	GetMemberRole(ctx context.Context, chatID, userID string) (string, error)

	// LeaveGroup 主动退出群聊
	LeaveGroup(ctx context.Context, chatID, userID string) error

	// GetLastReadMessageID 获取成员最后已读消息ID
	GetLastReadMessageID(ctx context.Context, chatID, userID string) (string, error)

	// UpdateLastReadMessageID 更新成员最后已读消息ID
	UpdateLastReadMessageID(ctx context.Context, chatID, userID, messageID string) error

	// CreateDirectChat 创建两人私聊（不存在才创建）
	CreateDirectChat(ctx context.Context, userID1, userID2 string) (*model.Chat, error)

	// Search 搜索聊天室（按名称模糊匹配）
	Search(ctx context.Context, keyword string, limit int) ([]*model.Chat, error)

	// CreateGroup 创建群聊
	CreateGroup(ctx context.Context, name, ownerID string, memberIDs []string) (*model.Chat, error)

	// UpdateGroupInfo 更新群聊信息（仅群主）
	UpdateGroupInfo(ctx context.Context, chatID, ownerID, name, avatarURL string) (*model.Chat, error)
}