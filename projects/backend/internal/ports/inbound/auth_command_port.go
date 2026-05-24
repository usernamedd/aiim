package inbound

import (
	"context"

	"aiim/internal/domain/model"
)

// AuthCommandPort 认证命令端口（handler → service）
// 定义外部（HTTP/WS Handler）可以调用的认证操作
type AuthCommandPort interface {
	// Register 用户注册
	Register(ctx context.Context, username, email, password, nickname string) (*model.User, error)

	// Login 用户登录，返回用户信息 + access token
	Login(ctx context.Context, username, password string) (*LoginResult, error)

	// RefreshToken 刷新令牌
	RefreshToken(ctx context.Context, refreshToken string) (*LoginResult, error)

	// Logout 登出（使 session 失效）
	Logout(ctx context.Context, sessionID string) error

	// ValidateToken 验证 token 并返回用户 ID
	ValidateToken(ctx context.Context, token string) (string, error)
}

// LoginResult 登录结果
type LoginResult struct {
	User         *model.User
	AccessToken  string
	RefreshToken string
	ExpiresAt    int64 // Unix timestamp
}

// AuthQueryPort 认证查询端口（只读操作）
type AuthQueryPort interface {
	// GetSession 获取会话信息
	GetSession(ctx context.Context, sessionID string) (*model.Session, error)
}

// --- 错误映射（handler 层用） ---
// AuthCommandPort 返回的错误对照表：
//   errors.ErrUserAlreadyExists → HTTP 409
//   errors.ErrInvalidCredentials → HTTP 401
//   errors.ErrTokenExpired → HTTP 401
//   errors.ErrTokenInvalid → HTTP 401
//   errors.ErrRefreshTokenInvalid → HTTP 401
//   context.DeadlineExceeded → HTTP 504