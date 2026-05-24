package errors

import "errors"

// 领域错误定义（使用 errors.New，不依赖任何框架）
// 这些错误会在 service 层产生，被 handler 层翻译为 HTTP 状态码

var (
	// --- 用户相关 ---
	ErrUserNotFound       = errors.New("user not found")
	ErrUserAlreadyExists   = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUsernameTaken      = errors.New("username already taken")
	ErrEmailTaken         = errors.New("email already taken")

	// --- 认证相关 ---
	ErrTokenExpired       = errors.New("token expired")
	ErrTokenInvalid       = errors.New("token invalid")
	ErrTokenMissing       = errors.New("token missing")
	ErrSessionNotFound    = errors.New("session not found")
	ErrSessionExpired     = errors.New("session expired")
	ErrRefreshTokenInvalid = errors.New("refresh token invalid")

	// --- 消息相关 ---
	ErrMessageNotFound   = errors.New("message not found")
	ErrChatNotFound     = errors.New("chat not found")
	ErrNotChatMember    = errors.New("not a chat member")
	ErrNotAuthorized    = errors.New("not authorized")

	// --- 参数校验 ---
	ErrInvalidInput = errors.New("invalid input")
)

// DomainError 带错误码的领域错误（可选，用于细粒度错误处理）
type DomainError struct {
	Code    string
	Message string
	Err     error
}

func (e *DomainError) Error() string {
	return e.Message
}

func (e *DomainError) Unwrap() error {
	return e.Err
}

// NewDomainError 创建领域错误
func NewDomainError(code, message string, err error) *DomainError {
	return &DomainError{Code: code, Message: message, Err: err}
}