package http

import (
	"net/http"
	"strings"

	"aiim/internal/config"
	"aiim/internal/ports/inbound"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware CORS 中间件，读取 config.yaml 中的 cors 配置
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allowedOrigins := config.Config.GetStringSlice("cors.allowed_origins")
		allowedMethods := config.Config.GetStringSlice("cors.allowed_methods")
		allowedHeaders := config.Config.GetStringSlice("cors.allowed_headers")
		exposeHeaders := config.Config.GetStringSlice("cors.expose_headers")
		allowCredentials := config.Config.GetBool("cors.allow_credentials")

		// 检查 origin 是否在白名单里
		validOrigin := ""
		for _, o := range allowedOrigins {
			if o == origin || o == "*" {
				validOrigin = o
				break
			}
		}

		if validOrigin != "" {
			c.Header("Access-Control-Allow-Origin", validOrigin)
			c.Header("Access-Control-Allow-Methods", strings.Join(allowedMethods, ", "))
			c.Header("Access-Control-Allow-Headers", strings.Join(allowedHeaders, ", "))
			c.Header("Access-Control-Expose-Headers", strings.Join(exposeHeaders, ", "))
			if allowCredentials {
				c.Header("Access-Control-Allow-Credentials", "true")
			}
			//允许 JSONP
			if c.GetHeader("Access-Control-Request-Method") != "" {
				c.Header("Access-Control-Allow-Methods", strings.Join(allowedMethods, ", "))
			}
		}

		// 处理 preflight
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

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