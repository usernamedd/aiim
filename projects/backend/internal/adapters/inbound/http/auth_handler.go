package http

import (
	"net/http"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
	"aiim/internal/ports/inbound"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	svc inbound.AuthCommandPort
}

func NewAuthHandler(svc inbound.AuthCommandPort) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// Register POST /api/v1/auth/register
type RegisterReq struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname" binding:"max=100"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid input: " + err.Error()})
		return
	}

	user, err := h.svc.Register(c.Request.Context(), req.Username, req.Email, req.Password, req.Nickname)
	if err != nil {
		switch err {
		case errors.ErrUsernameTaken:
			c.JSON(http.StatusConflict, gin.H{"code": 409, "message": err.Error()})
		case errors.ErrEmailTaken:
			c.JSON(http.StatusConflict, gin.H{"code": 409, "message": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    0,
		"message": "created",
		"data": gin.H{
			"user_id":  user.ID,
			"username": user.Username,
			"email":    user.Email,
			"nickname": user.Nickname,
		},
	})
}

// Login POST /api/v1/auth/login
type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid input"})
		return
	}

	result, err := h.svc.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		switch err {
		case errors.ErrInvalidCredentials:
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data": gin.H{
			"user":         toUserDTO(result.User),
			"access_token":  result.AccessToken,
			"refresh_token": result.RefreshToken,
			"expires_at":    result.ExpiresAt,
		},
	})
}

// RefreshToken POST /api/v1/auth/refresh
type RefreshReq struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid input"})
		return
	}

	result, err := h.svc.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		switch err {
		case errors.ErrRefreshTokenInvalid, errors.ErrTokenExpired:
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data": gin.H{
			"access_token":  result.AccessToken,
			"refresh_token": result.RefreshToken,
			"expires_at":    result.ExpiresAt,
		},
	})
}

// Logout POST /api/v1/auth/logout
type LogoutReq struct {
	SessionID string `json:"session_id" binding:"required"`
}

func (h *AuthHandler) Logout(c *gin.Context) {
	var req LogoutReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid input"})
		return
	}

	if err := h.svc.Logout(c.Request.Context(), req.SessionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok"})
}

func toUserDTO(u *model.User) gin.H {
	return gin.H{
		"id":         u.ID,
		"username":   u.Username,
		"email":      u.Email,
		"nickname":   u.Nickname,
		"avatar_url": u.AvatarURL,
		"status":     u.Status,
	}
}