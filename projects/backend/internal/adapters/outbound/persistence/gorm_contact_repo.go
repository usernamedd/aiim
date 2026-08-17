package persistence

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// ContactRepository 联系人仓储接口
type ContactRepository interface {
	AddContact(ctx context.Context, userID, contactID string, remark string) error
	RemoveContact(ctx context.Context, userID, contactID string) error
	UpdateRemark(ctx context.Context, userID, contactID, remark string) error
	ListContacts(ctx context.Context, userID string) ([]string, error)
}

// GORMContactRepo GORM 联系人仓储实现
type GORMContactRepo struct {
	db *DB
}

func NewGORMContactRepo(db *DB) *GORMContactRepo {
	return &GORMContactRepo{db: db}
}

func (r *GORMContactRepo) AddContact(ctx context.Context, userID, contactID, remark string) error {
	entry := ContactGORM{
		ID:        uuid.New().String(),
		UserID:    userID,
		ContactID: contactID,
		Remark:    remark,
		CreatedAt: time.Now(),
	}
	return r.db.WithContext(ctx).Create(&entry).Error
}

func (r *GORMContactRepo) RemoveContact(ctx context.Context, userID, contactID string) error {
	return r.db.WithContext(ctx).
		Where("user_id = ? AND contact_id = ?", userID, contactID).
		Delete(&ContactGORM{}).Error
}

func (r *GORMContactRepo) UpdateRemark(ctx context.Context, userID, contactID, remark string) error {
	return r.db.WithContext(ctx).
		Model(&ContactGORM{}).
		Where("user_id = ? AND contact_id = ?", userID, contactID).
		Update("remark", remark).Error
}

func (r *GORMContactRepo) ListContacts(ctx context.Context, userID string) ([]string, error) {
	var entries []ContactGORM
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Find(&entries).Error; err != nil {
		return nil, err
	}
	result := make([]string, len(entries))
	for i, e := range entries {
		result[i] = e.ContactID
	}
	return result, nil
}