package persistence

import (
	"context"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
)

// GORMUserRepo GORM 用户仓储实现
type GORMUserRepo struct {
	db *DB
}

func NewGORMUserRepo(db *DB) *GORMUserRepo {
	return &GORMUserRepo{db: db}
}

func (r *GORMUserRepo) Save(ctx context.Context, user *model.User) error {
	u := toUserGORM(user)
	return r.db.WithContext(ctx).Save(u).Error
}

func (r *GORMUserRepo) FindByID(ctx context.Context, id string) (*model.User, error) {
	var u UserGORM
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&u).Error; err != nil {
		return nil, errors.ErrUserNotFound
	}
	return toUserModel(&u), nil
}

func (r *GORMUserRepo) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	var u UserGORM
	if err := r.db.WithContext(ctx).Where("username = ?", username).First(&u).Error; err != nil {
		return nil, errors.ErrUserNotFound
	}
	return toUserModel(&u), nil
}

func (r *GORMUserRepo) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var u UserGORM
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&u).Error; err != nil {
		return nil, errors.ErrUserNotFound
	}
	return toUserModel(&u), nil
}

func (r *GORMUserRepo) FindByIDs(ctx context.Context, ids []string) ([]*model.User, error) {
	var users []*model.User
	rows, err := r.db.WithContext(ctx).Where("id IN ?", ids).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var u UserGORM
		if err := rows.Scan(&u); err == nil {
			users = append(users, toUserModel(&u))
		}
	}
	return users, nil
}

func (r *GORMUserRepo) Search(ctx context.Context, keyword string, limit, offset int) ([]*model.User, int, error) {
	var usersGORM []UserGORM
	query := r.db.WithContext(ctx).Model(&UserGORM{}).Where("username LIKE ? OR email LIKE ? OR nickname LIKE ?",
		"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Limit(limit).Offset(offset).Find(&usersGORM).Error; err != nil {
		return nil, 0, err
	}
	users := make([]*model.User, len(usersGORM))
	for i := range usersGORM {
		users[i] = toUserModel(&usersGORM[i])
	}
	return users, int(total), nil
}

func (r *GORMUserRepo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&UserGORM{}, "id = ?", id).Error
}

// --- 转换函数 ---

func toUserGORM(u *model.User) *UserGORM {
	return &UserGORM{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		Password:  u.Password,
		Nickname:  u.Nickname,
		AvatarURL: u.AvatarURL,
		Status:    string(u.Status),
	}
}

func toUserModel(u *UserGORM) *model.User {
	return &model.User{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		Password:  u.Password,
		Nickname:  u.Nickname,
		AvatarURL: u.AvatarURL,
		Status:    model.UserStatus(u.Status),
	}
}