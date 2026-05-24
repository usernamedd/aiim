package service

import (
	"context"
	"time"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
	"aiim/internal/ports/inbound"
	"aiim/internal/ports/outbound"

	"github.com/google/uuid"
)

type MessageService struct {
	msgRepo  outbound.MessageRepositoryPort
	chatRepo outbound.ChatRepositoryPort
	wsHub    outbound.WSHubPort
}

func NewMessageService(
	msgRepo outbound.MessageRepositoryPort,
	chatRepo outbound.ChatRepositoryPort,
	wsHub outbound.WSHubPort,
) inbound.MessageCommandPort {
	return &MessageService{msgRepo: msgRepo, chatRepo: chatRepo, wsHub: wsHub}
}

func (s *MessageService) SendMessage(ctx context.Context, chatID, senderID string, content model.MessageContent) (*model.Message, error) {
	isMember, err := s.chatRepo.IsMember(ctx, chatID, senderID)
	if err != nil {
		return nil, errors.ErrChatNotFound
	}
	if !isMember {
		return nil, errors.ErrNotChatMember
	}

	msg := &model.Message{
		ID:        uuid.New().String(),
		ChatID:    chatID,
		SenderID:  senderID,
		Content:   content,
		Status:    model.MessageStatusSent,
		CreatedAt: time.Now(),
	}

	if err := s.msgRepo.Save(ctx, msg); err != nil {
		return nil, err
	}

	// 广播给聊天室成员
	members, _ := s.chatRepo.GetMembers(ctx, chatID)
	var memberIDs []string
	for _, m := range members {
		memberIDs = append(memberIDs, m.ID)
	}

	s.wsHub.SendToUsers(memberIDs, outbound.WSMessage{
		Type:    outbound.WSMsgTypeMessage,
		Payload: msg,
	})

	return msg, nil
}

func (s *MessageService) MarkAsRead(ctx context.Context, userID, chatID string, messageID string) error {
	return s.msgRepo.UpdateStatus(ctx, messageID, model.MessageStatusRead)
}

func (s *MessageService) DeleteMessage(ctx context.Context, userID, messageID string) error {
	msg, err := s.msgRepo.FindByID(ctx, messageID)
	if err != nil {
		return errors.ErrMessageNotFound
	}
	if msg.SenderID != userID {
		return errors.ErrNotAuthorized
	}
	return s.msgRepo.Delete(ctx, messageID)
}

func (s *MessageService) RecallMessage(ctx context.Context, userID, messageID string) error {
	msg, err := s.msgRepo.FindByID(ctx, messageID)
	if err != nil {
		return errors.ErrMessageNotFound
	}
	if msg.SenderID != userID {
		return errors.ErrNotAuthorized
	}
	// TODO: 时间窗口检查（如 5 分钟内）
	return s.msgRepo.Delete(ctx, messageID)
}

func (s *MessageService) GetMessages(ctx context.Context, chatID string, beforeID string, limit int) ([]*model.Message, error) {
	return s.msgRepo.FindByChatID(ctx, chatID, beforeID, limit)
}

func (s *MessageService) GetUnreadCount(ctx context.Context, userID, chatID string) (int, error) {
	return s.msgRepo.CountUnread(ctx, userID, chatID)
}

func (s *MessageService) GetRecentChats(ctx context.Context, userID string, limit int) ([]*inbound.ChatPreview, error) {
	chats, err := s.chatRepo.ListByUser(ctx, userID, limit)
	if err != nil {
		return nil, err
	}
	var previews []*inbound.ChatPreview
	for _, chat := range chats {
		previews = append(previews, &inbound.ChatPreview{
			Chat: chat,
		})
	}
	return previews, nil
}