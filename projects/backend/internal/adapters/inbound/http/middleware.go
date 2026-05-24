package http

import (
	"net/http"
	"strings"

	"aiim/internal/ports/inbound"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 认证中间件
type AuthMiddleware struct {
	authSvc inbound.AuthCommandPort
}

func NewAuthMiddleware(authSvc inbound.AuthCommandPort) *AuthMiddleware {
	return &AuthMiddleware{authSvc: authSvc}
}

func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "token missing",
			})
			return
		}

		// Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "token format invalid",
			})
			return
		}

		token := parts[1]
		userID, err := m.authSvc.ValidateToken(c.Request.Context(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": err.Error(),
			})
			return
		}

		// 注入 userID 到 context
		c.Set("userID", userID)
		c.Next()
	}
}

// GetUserID 从 context 获取当前用户 ID
func GetUserID(c *gin.Context) string {
	if id, exists := c.Get("userID"); exists {
		return id.(string)
	}
	return ""
}