package model

import (
	"time"
)

// User 纯领域模型，不含任何 ORM tag
type User struct {
	ID        string    // UUID
	Username  string    // 唯一用户名
	Email     string    // 唯一邮箱
	Password  string    // bcrypt 哈希（客户端不暴露）
	Nickname  string    // 显示名
	AvatarURL string    // 头像 URL
	Status    UserStatus // online/offline/away
	CreatedAt time.Time
	UpdatedAt time.Time
}

// UserStatus 用户状态枚举
type UserStatus string

const (
	UserStatusOnline  UserStatus = "online"
	UserStatusOffline UserStatus = "offline"
	UserStatusAway   UserStatus = "away"
)

// IsValid 检查状态是否合法
func (s UserStatus) IsValid() bool {
	switch s {
	case UserStatusOnline, UserStatusOffline, UserStatusAway:
		return true
	}
	return false
}