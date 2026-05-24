package persistence

import (
	"context"
	"time"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
)

type GORMSessionRepo struct {
	db *DB
}

func NewGROMSessionRepo(db *DB) *GORMSessionRepo {
	return &GORMSessionRepo{db: db}
}

func (r *GORMSessionRepo) Save(ctx context.Context, s *model.Session) error {
	return r.db.WithContext(ctx).Save(&SessionGORM{
		ID:        s.ID,
		UserID:    s.UserID,
		TokenHash: s.TokenHash,
		ExpiresAt: s.ExpiresAt,
		CreatedAt: s.CreatedAt,
		IpAddress: s.IpAddress,
		UserAgent: s.UserAgent,
	}).Error
}

func (r *GORMSessionRepo) FindByID(ctx context.Context, id string) (*model.Session, error) {
	var s SessionGORM
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&s).Error; err != nil {
		return nil, errors.ErrSessionNotFound
	}
	return &model.Session{
		ID:        s.ID,
		UserID:    s.UserID,
		TokenHash: s.TokenHash,
		ExpiresAt: s.ExpiresAt,
		CreatedAt: s.CreatedAt,
		IpAddress: s.IpAddress,
		UserAgent: s.UserAgent,
	}, nil
}

func (r *GORMSessionRepo) FindByTokenHash(ctx context.Context, hash string) (*model.Session, error) {
	var s SessionGORM
	if err := r.db.WithContext(ctx).Where("token_hash = ?", hash).First(&s).Error; err != nil {
		return nil, errors.ErrSessionNotFound
	}
	return &model.Session{
		ID:        s.ID,
		UserID:    s.UserID,
		TokenHash: s.TokenHash,
		ExpiresAt: s.ExpiresAt,
		CreatedAt: s.CreatedAt,
		IpAddress: s.IpAddress,
		UserAgent: s.UserAgent,
	}, nil
}

func (r *GORMSessionRepo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&SessionGORM{}, "id = ?", id).Error
}

func (r *GORMSessionRepo) DeleteByUserID(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Delete(&SessionGORM{}, "user_id = ?", userID).Error
}

func (r *GORMSessionRepo) DeleteExpired(ctx context.Context) error {
	return r.db.WithContext(ctx).Delete(&SessionGORM{}, "expires_at < ?", time.Now()).Error
}