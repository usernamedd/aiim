package persistence

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// BlockListRepository 黑名单仓储接口
type BlockListRepository interface {
	AddBlock(ctx context.Context, userID, blockedID string) error
	RemoveBlock(ctx context.Context, userID, blockedID string) error
	IsBlocked(ctx context.Context, userID, blockedID string) (bool, error)
	ListBlocked(ctx context.Context, userID string) ([]string, error)
}

// GORMBlockListRepo GORM 黑名单仓储实现
type GORMBlockListRepo struct {
	db *DB
}

func NewGORMBlockListRepo(db *DB) *GORMBlockListRepo {
	return &GORMBlockListRepo{db: db}
}

func (r *GORMBlockListRepo) AddBlock(ctx context.Context, userID, blockedID string) error {
	entry := BlockListGORM{
		ID:        uuid.New().String(),
		UserID:    userID,
		BlockedID: blockedID,
		CreatedAt: time.Now(),
	}
	return r.db.WithContext(ctx).Create(&entry).Error
}

func (r *GORMBlockListRepo) RemoveBlock(ctx context.Context, userID, blockedID string) error {
	return r.db.WithContext(ctx).
		Where("user_id = ? AND blocked_id = ?", userID, blockedID).
		Delete(&BlockListGORM{}).Error
}

func (r *GORMBlockListRepo) IsBlocked(ctx context.Context, userID, blockedID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&BlockListGORM{}).
		Where("user_id = ? AND blocked_id = ?", userID, blockedID).
		Count(&count).Error
	return count > 0, err
}

func (r *GORMBlockListRepo) ListBlocked(ctx context.Context, userID string) ([]string, error) {
	var entries []BlockListGORM
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Find(&entries).Error; err != nil {
		return nil, err
	}
	result := make([]string, len(entries))
	for i, e := range entries {
		result[i] = e.BlockedID
	}
	return result, nil
}