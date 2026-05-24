package outbound

import (
	"context"

	"aiim/internal/domain/model"
)

// SessionRepositoryPort 会话仓储端口
type SessionRepositoryPort interface {
	// Save 创建或更新会话
	Save(ctx context.Context, session *model.Session) error

	// FindByID 根据 ID 查找
	FindByID(ctx context.Context, id string) (*model.Session, error)

	// FindByTokenHash 根据 token 指纹查找
	FindByTokenHash(ctx context.Context, tokenHash string) (*model.Session, error)

	// Delete 删除会话（登出）
	Delete(ctx context.Context, id string) error

	// DeleteByUserID 删除用户所有会话
	DeleteByUserID(ctx context.Context, userID string) error

	// DeleteExpired 删除过期会话（定时清理）
	DeleteExpired(ctx context.Context) error
}