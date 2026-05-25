package http

import (
	"strconv"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/service"
	"aiim/internal/ports/inbound"
	"aiim/pkg/response"

	"github.com/gin-gonic/gin"
)

// ChatHandler 聊天相关 HTTP 处理
type ChatHandler struct {
	msgSvc  inbound.MessageCommandPort
	authSvc inbound.AuthCommandPort
}

func NewChatHandler(msgSvc *service.MessageService, authSvc inbound.AuthCommandPort) *ChatHandler {
	return &ChatHandler{msgSvc: msgSvc, authSvc: authSvc}
}

// GetRecentChats GET /api/v1/chats
// Header: Authorization: Bearer <token>
// Response: { "code": 0, "data": { "chats": [...], "total": N } }
func (h *ChatHandler) GetRecentChats(c *gin.Context) {
	uid, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	uidStr := uid.(string)
	
	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	chats, err := h.msgSvc.GetRecentChats(c.Request.Context(), uidStr, limit)
	if err != nil {
		c.JSON(500, gin.H{"code": 500, "message": err.Error()})
		return
	}

	response.Success(c, gin.H{
		"chats": chats,
		"total": len(chats),
	})
}

// GetChatMessages GET /api/v1/chats/:chat_id/messages
// Header: Authorization: Bearer <token>
// Query: ?limit=20&before=<message_id>
// Response: { "code": 0, "data": { "messages": [...], "has_more": true } }
func (h *ChatHandler) GetChatMessages(c *gin.Context) {
	_, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	chatID := c.Param("chat_id")
	if chatID == "" {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	beforeID := c.Query("before")

	messages, err := h.msgSvc.GetMessages(c.Request.Context(), chatID, beforeID, limit)
	if err != nil {
		response.Error(c, err)
		return
	}

	hasMore := len(messages) == limit

	response.Success(c, gin.H{
		"messages": messages,
		"has_more": hasMore,
	})
}

// GetChatDetail GET /api/v1/chats/:chat_id
// Header: Authorization: Bearer ***
// Response: { "code": 0, "data": { "chat": {...}, "members": [...] } }
func (h *ChatHandler) GetChatDetail(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	chatID := c.Param("chat_id")
	if chatID == "" {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	chat, members, err := h.msgSvc.GetChatDetail(c.Request.Context(), chatID, userID.(string))
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chat":    chat,
		"members": members,
	})
}

// SearchChats GET /api/v1/chats/search?q=xxx
// Header: Authorization: Bearer ***
func (h *ChatHandler) SearchChats(c *gin.Context) {
	_, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	query := c.Query("q")
	if query == "" {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	chats, err := h.msgSvc.SearchChats(c.Request.Context(), query, limit)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chats": chats,
		"total": len(chats),
	})
}

// CreateDirectChat POST /api/v1/chats/direct
// Header: Authorization: Bearer ***
// Body: { "user_id": "对方的user_id" }
// Response: { "code": 0, "data": { "chat": {...} } }
func (h *ChatHandler) CreateDirectChat(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	var req struct {
		UserID string `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	chat, err := h.msgSvc.CreateDirectChat(c.Request.Context(), userID.(string), req.UserID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chat": chat,
	})
}

// CreateGroup POST /api/v1/chats/group
// Header: Authorization: Bearer ***
// Body: { "name": "群名称", "member_ids": ["user_id1", "user_id2", ...] }
// Response: { "code": 0, "data": { "chat": {...} } }
func (h *ChatHandler) CreateGroup(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	var req struct {
		Name      string   `json:"name" binding:"required"`
		MemberIDs []string `json:"member_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	chat, err := h.msgSvc.CreateGroup(c.Request.Context(), req.Name, userID.(string), req.MemberIDs)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chat": chat,
	})
}

// UpdateGroupInfo PUT /api/v1/chats/:chat_id
// Header: Authorization: Bearer ***
// Body: { "name": "新群名", "avatar_url": "xxx" }
func (h *ChatHandler) UpdateGroupInfo(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	chatID := c.Param("chat_id")
	if chatID == "" {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	var req struct {
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	chat, err := h.msgSvc.UpdateGroupInfo(c.Request.Context(), chatID, userID.(string), req.Name, req.AvatarURL)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chat": chat,
	})
}

// AddMembers POST /api/v1/chats/:chat_id/members
// Header: Authorization: Bearer ***
// Body: { "member_ids": ["user_id1", "user_id2", ...] }
func (h *ChatHandler) AddMembers(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	chatID := c.Param("chat_id")
	if chatID == "" {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	var req struct {
		MemberIDs []string `json:"member_ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	err := h.msgSvc.AddMembers(c.Request.Context(), chatID, userID.(string), req.MemberIDs)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chat_id": chatID,
		"added":   len(req.MemberIDs),
	})
}

// RemoveMember DELETE /api/v1/chats/:chat_id/members/:user_id
// Header: Authorization: Bearer ***
func (h *ChatHandler) RemoveMember(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	chatID := c.Param("chat_id")
	targetID := c.Param("user_id")
	if chatID == "" || targetID == "" {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	err := h.msgSvc.RemoveMember(c.Request.Context(), chatID, userID.(string), targetID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chat_id": chatID,
		"removed": targetID,
	})
}

// LeaveGroup DELETE /api/v1/chats/:chat_id/members/me
// Header: Authorization: Bearer ***
func (h *ChatHandler) LeaveGroup(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		response.Error(c, errors.ErrNotAuthorized)
		return
	}

	chatID := c.Param("chat_id")
	if chatID == "" {
		response.Error(c, errors.ErrInvalidInput)
		return
	}

	err := h.msgSvc.LeaveGroup(c.Request.Context(), chatID, userID.(string))
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{
		"chat_id": chatID,
		"left":    userID,
	})
}