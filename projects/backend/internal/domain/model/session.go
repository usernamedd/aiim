package model

import "time"

// Session 用户会话（登录会话）
type Session struct {
	ID        string    // UUID
	UserID    string    // 外键→User.ID
	TokenHash string    // 令牌指纹（sha256）
	ExpiresAt time.Time // 过期时间
	CreatedAt time.Time
	IpAddress string    // 登录 IP
	UserAgent string    // 客户端 UA
}

// IsExpired 检查会话是否过期
func (s *Session) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}