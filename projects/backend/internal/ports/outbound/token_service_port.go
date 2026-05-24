package outbound

import "aiim/internal/domain/model"

// TokenServicePort Token 服务端口
// 定义 JWT 令牌的生成和验证标准接口
type TokenServicePort interface {
	// GenerateAccessToken 生成 Access Token（短期，15min）
	GenerateAccessToken(user *model.User, sessionID string) (string, int64, error)

	// GenerateRefreshToken 生成 Refresh Token（长期，7d）
	GenerateRefreshToken(user *model.User, sessionID string) (string, error)

	// ValidateAccessToken 验证 Access Token，返回 userID + sessionID
	ValidateAccessToken(token string) (userID, sessionID string, err error)

	// ValidateRefreshToken 验证 Refresh Token
	ValidateRefreshToken(token string) (userID, sessionID string, err error)

	// HashToken 计算 token 哈希（用于存储）
	HashToken(token string) string
}