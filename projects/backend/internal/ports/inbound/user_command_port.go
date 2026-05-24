package inbound

import (
	"context"

	"aiim/internal/domain/model"
)

// UserCommandPort 用户命令端口（handler → service）
type UserCommandPort interface {
	// UpdateProfile 更新个人资料
	UpdateProfile(ctx context.Context, userID string, nickname, avatarURL string) (*model.User, error)

	// UpdatePassword 修改密码
	UpdatePassword(ctx context.Context, userID, oldPwd, newPwd string) error

	// SearchUsers 搜索用户（分页）
	SearchUsers(ctx context.Context, keyword string, limit, offset int) ([]*model.User, int, error)

	// GetUserByID 获取用户详情
	GetUserByID(ctx context.Context, userID string) (*model.User, error)

	// GetUsersByIDs 批量获取用户（WebSocket 在线状态广播用）
	GetUsersByIDs(ctx context.Context, userIDs []string) ([]*model.User, error)
}

// UserQueryPort 用户查询端口（只读）
type UserQueryPort interface {
	// ListFriends 列出好友关系
	ListFriends(ctx context.Context, userID string) ([]*model.User, error)

	// GetUserStatus 获取用户状态
	GetUserStatus(ctx context.Context, userID string) (model.UserStatus, error)
}