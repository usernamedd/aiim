package http

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"aiim/internal/adapters/outbound/realtime"
	"aiim/internal/domain/model"
	"aiim/internal/ports/inbound"
	"aiim/internal/ports/outbound"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WSHandler WebSocket 处理器
type WSHandler struct {
	hub    *realtime.WSHub
	msgSvc inbound.MessageCommandPort
	authSvc inbound.AuthCommandPort
}

func NewWSHandler(msgSvc inbound.MessageCommandPort, hub *realtime.WSHub, authSvc inbound.AuthCommandPort) *WSHandler {
	return &WSHandler{hub: hub, msgSvc: msgSvc, authSvc: authSvc}
}

// HandleWS GET /api/v1/ws
func (h *WSHandler) HandleWS(c *gin.Context) {
	tokenStr := c.Query("token")
	if tokenStr == "" {
		auth := c.GetHeader("Authorization")
		if strings.HasPrefix(auth, "Bearer ") {
			tokenStr = strings.TrimPrefix(auth, "Bearer ")
		}
	}
	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "token missing"})
		return
	}

	userID, err := h.authSvc.ValidateToken(c.Request.Context(), tokenStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "invalid token"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	wc := realtime.NewConn(conn, userID)
	h.hub.Register(wc, userID)

	go wc.WritePump()
	go wc.ReadPump(func(data []byte) {
		h.onMessage(userID, wc, data)
	})
}

func (h *WSHandler) onMessage(userID string, wc *realtime.Conn, data []byte) {
	if data == nil {
		h.hub.Unregister(wc, userID)
		return
	}

	var msg struct {
		Type    string          `json:"type"`
		Payload json.RawMessage `json:"payload"`
	}
	if err := json.Unmarshal(data, &msg); err != nil {
		h.sendError(wc, "invalid JSON")
		return
	}

	ctx := context.Background()

	switch msg.Type {
	case "ping":
		h.hub.SendToUser(userID, outbound.WSMessage{Type: outbound.WSMsgTypePong})

	case "mark_read":
		var p struct {
			ChatID    string `json:"chat_id"`
			MessageID string `json:"message_id"`
		}
		json.Unmarshal(msg.Payload, &p)
		err := h.msgSvc.MarkAsRead(ctx, userID, p.ChatID, p.MessageID)
		if err != nil {
			h.sendError(wc, err.Error())
			return
		}
		// B3: 发 read_receipt 给消息发送者（由 MessageService 内部处理）

	case "get_unread":
		// B4: 用户打开聊天室时主动查询未读数
		var p struct {
			ChatID string `json:"chat_id"`
		}
		json.Unmarshal(msg.Payload, &p)
		count, err := h.msgSvc.GetUnreadCount(ctx, userID, p.ChatID)
		if err == nil {
			h.hub.SendToUser(userID, outbound.WSMessage{
				Type: outbound.WSMsgTypeUnreadCount,
				Payload: map[string]interface{}{
					"chat_id": p.ChatID,
					"unread":  count,
				},
			})
		}

	case "send_message":
		var p struct {
			Text        string `json:"text"`
			ChatID      string `json:"chat_id"`
			ClientMsgID string `json:"client_msg_id"`
			Type        string `json:"type"`        // text/image/file/voice/code
			Url         string `json:"url"`         // 富媒体 URL
			MimeType    string `json:"mime_type"`    // MIME 类型
			Size        int64  `json:"size"`        // 文件大小
			Thumbnail   string `json:"thumbnail"`    // 缩略图 URL
			Duration    int    `json:"duration"`    // 音视频时长
			Width       int    `json:"width"`       // 图片宽度
			Height      int    `json:"height"`      // 图片高度
		}
		json.Unmarshal(msg.Payload, &p)

		// B6: 支持富媒体消息类型
		contentType := model.ContentTypeText
		if p.Type == "image" || p.Type == "file" || p.Type == "voice" || p.Type == "code" {
			contentType = model.ContentType(p.Type)
		}

		content := model.MessageContent{
			Type:         contentType,
			Text:         p.Text,
			Url:          p.Url,
			MimeType:     p.MimeType,
			Size:         p.Size,
			ThumbnailUrl: p.Thumbnail,
			Duration:     p.Duration,
			Width:        p.Width,
			Height:       p.Height,
		}
		sent, err := h.msgSvc.SendMessage(ctx, p.ChatID, userID, content)
		if err != nil {
			h.sendError(wc, err.Error())
			return
		}
		h.hub.SendToUser(userID, outbound.WSMessage{
			Type: outbound.WSMsgTypeAck,
			Payload: map[string]interface{}{
				"client_msg_id": p.ClientMsgID,
				"server_msg_id": sent.ID,
			},
		})
	}
}

func (h *WSHandler) sendError(wc *realtime.Conn, errMsg string) {
	wc.WriteMessage(outbound.WSMessage{
		Type:    outbound.WSMsgTypeError,
		Payload: map[string]string{"message": errMsg},
	})
}