package http

import (
	"net/http"
	"strconv"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
	"aiim/internal/ports/inbound"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	svc inbound.UserCommandPort
}

func NewUserHandler(svc inbound.UserCommandPort) *UserHandler {
	return &UserHandler{svc: svc}
}

// SearchUsers GET /api/v1/users/search?keyword=xxx&limit=20&offset=0
func (h *UserHandler) SearchUsers(c *gin.Context) {
	keyword := c.Query("keyword")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	users, total, err := h.svc.SearchUsers(c.Request.Context(), keyword, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data": gin.H{
			"users": usersToDTO(users),
			"total": total,
		},
	})
}

// GetUser GET /api/v1/users/:id
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := h.svc.GetUserByID(c.Request.Context(), id)
	if err != nil {
		if err == errors.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "user not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data":    toUserDTO(user),
	})
}

// UpdateProfile PUT /api/v1/users/profile
type UpdateProfileReq struct {
	Nickname  string `json:"nickname"`
	AvatarURL string `json:"avatar_url"`
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "unauthorized"})
		return
	}

	var req UpdateProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid input"})
		return
	}

	user, err := h.svc.UpdateProfile(c.Request.Context(), userID, req.Nickname, req.AvatarURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data":    toUserDTO(user),
	})
}

func usersToDTO(users []*model.User) []gin.H {
	result := make([]gin.H, len(users))
	for i, u := range users {
		result[i] = toUserDTO(u)
	}
	return result
}

// AddContact POST /api/v1/contacts
func (h *UserHandler) AddContact(c *gin.Context) {
	userID := GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "unauthorized"})
		return
	}
	var req struct {
		ContactID string `json:"contact_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid input"})
		return
	}
	if err := h.svc.AddContact(c.Request.Context(), userID, req.ContactID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok"})
}

// RemoveContact DELETE /api/v1/contacts/:id
func (h *UserHandler) RemoveContact(c *gin.Context) {
	userID := GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "unauthorized"})
		return
	}
	contactID := c.Param("id")
	if err := h.svc.RemoveContact(c.Request.Context(), userID, contactID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok"})
}

// ListContacts GET /api/v1/contacts
func (h *UserHandler) ListContacts(c *gin.Context) {
	userID := GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "unauthorized"})
		return
	}
	contacts, err := h.svc.ListContacts(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok", "data": gin.H{"contacts": usersToDTO(contacts)}})
}

// BlockUser POST /api/v1/block
func (h *UserHandler) BlockUser(c *gin.Context) {
	userID := GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "unauthorized"})
		return
	}
	var req struct {
		BlockedID string `json:"blocked_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid input"})
		return
	}
	if err := h.svc.BlockUser(c.Request.Context(), userID, req.BlockedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok"})
}

// UnblockUser DELETE /api/v1/block/:id
func (h *UserHandler) UnblockUser(c *gin.Context) {
	userID := GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "unauthorized"})
		return
	}
	blockedID := c.Param("id")
	if err := h.svc.UnblockUser(c.Request.Context(), userID, blockedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok"})
}

// ListBlocked GET /api/v1/block
func (h *UserHandler) ListBlocked(c *gin.Context) {
	userID := GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "unauthorized"})
		return
	}
	blocked, err := h.svc.ListBlocked(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok", "data": gin.H{"blocked": usersToDTO(blocked)}})
}