package outbound

import (
	"context"

	"aiim/internal/domain/model"
)

// UserRepositoryPort 用户仓储端口（outbound port）
// 定义 User 数据持久化的标准接口，不依赖 GORM
type UserRepositoryPort interface {
	// Save 创建或更新用户
	Save(ctx context.Context, user *model.User) error

	// FindByID 根据 ID 查找
	FindByID(ctx context.Context, id string) (*model.User, error)

	// FindByUsername 根据用户名查找
	FindByUsername(ctx context.Context, username string) (*model.User, error)

	// FindByEmail 根据邮箱查找
	FindByEmail(ctx context.Context, email string) (*model.User, error)

	// FindByIDs 批量查找
	FindByIDs(ctx context.Context, ids []string) ([]*model.User, error)

	// Search 搜索用户（用户名/邮箱/昵称模糊匹配）
	Search(ctx context.Context, keyword string, limit, offset int) ([]*model.User, int, error)

	// Delete 删除用户
	Delete(ctx context.Context, id string) error
}