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