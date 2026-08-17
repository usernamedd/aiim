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
) *MessageService {
	return &MessageService{msgRepo: msgRepo, chatRepo: chatRepo, wsHub: wsHub}
}

// CreateDirectChat 创建私聊
func (s *MessageService) CreateDirectChat(ctx context.Context, userID1, userID2 string) (*model.Chat, error) {
	return s.chatRepo.CreateDirectChat(ctx, userID1, userID2)
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
	// B5: 更新成员已读位置
	err := s.chatRepo.UpdateLastReadMessageID(ctx, chatID, userID, messageID)
	if err != nil {
		return err
	}

	// B2: 获取消息发送者，发 read_receipt（B3）
	msg, err := s.msgRepo.FindByID(ctx, messageID)
	if err == nil && msg.SenderID != userID {
		// 发给消息发送者
		s.wsHub.SendToUser(msg.SenderID, outbound.WSMessage{
			Type: outbound.WSMsgTypeReadReceipt,
			Payload: map[string]interface{}{
				"chat_id":    chatID,
				"message_id": messageID,
				"read_by":    userID,
			},
		})
	}

	// B2: 广播 message_read 给聊天室其他成员
	members, _ := s.chatRepo.GetMembers(ctx, chatID)
	for _, m := range members {
		if m.ID != userID {
			s.wsHub.SendToUser(m.ID, outbound.WSMessage{
				Type: outbound.WSMsgTypeMessageRead,
				Payload: map[string]interface{}{
					"chat_id":    chatID,
					"user_id":    userID,
					"message_id": messageID,
				},
			})
		}
	}
	return nil
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

// SearchChats 搜索聊天室
func (s *MessageService) SearchChats(ctx context.Context, keyword string, limit int) ([]*model.Chat, error) {
	return s.chatRepo.Search(ctx, keyword, limit)
}

// GetChatDetail 获取聊天室详情（含成员）
func (s *MessageService) GetChatDetail(ctx context.Context, chatID, userID string) (*model.Chat, []*model.User, error) {
	chat, err := s.chatRepo.FindByID(ctx, chatID)
	if err != nil {
		return nil, nil, err
	}
	isMember, err := s.chatRepo.IsMember(ctx, chatID, userID)
	if err != nil || !isMember {
		return nil, nil, errors.ErrNotChatMember
	}
	members, err := s.chatRepo.GetMembers(ctx, chatID)
	if err != nil {
		return nil, nil, err
	}
	return chat, members, nil
}

// CreateGroup 创建群聊
func (s *MessageService) CreateGroup(ctx context.Context, name, ownerID string, memberIDs []string) (*model.Chat, error) {
	return s.chatRepo.CreateGroup(ctx, name, ownerID, memberIDs)
}

// UpdateGroupInfo 更新群聊信息
func (s *MessageService) UpdateGroupInfo(ctx context.Context, chatID, ownerID, name, avatarURL string) (*model.Chat, error) {
	return s.chatRepo.UpdateGroupInfo(ctx, chatID, ownerID, name, avatarURL)
}

// AddMembers 批量添加成员（需群主/管理员权限）
func (s *MessageService) AddMembers(ctx context.Context, chatID, operatorID string, memberIDs []string) error {
	// 权限校验：操作者必须是群主或管理员
	role, err := s.chatRepo.GetMemberRole(ctx, chatID, operatorID)
	if err != nil {
		return errors.ErrNotChatMember
	}
	if role != string(model.MemberRoleOwner) && role != string(model.MemberRoleAdmin) {
		return errors.ErrNotAuthorized
	}

	// 批量添加
	err = s.chatRepo.AddMembers(ctx, chatID, memberIDs, string(model.MemberRoleMember))
	if err != nil {
		return err
	}

	// 广播成员加入事件
	s.wsHub.BroadcastToChat(chatID, outbound.WSMessage{
		Type: outbound.WSMsgTypeMemberJoined,
		Payload: map[string]interface{}{
			"chat_id":    chatID,
			"member_ids": memberIDs,
		},
	})
	return nil
}

// RemoveMember 移除成员（需群主/管理员权限）
func (s *MessageService) RemoveMember(ctx context.Context, chatID, operatorID, targetID string) error {
	// 权限校验
	role, err := s.chatRepo.GetMemberRole(ctx, chatID, operatorID)
	if err != nil {
		return errors.ErrNotChatMember
	}
	if role != string(model.MemberRoleOwner) && role != string(model.MemberRoleAdmin) {
		return errors.ErrNotAuthorized
	}

	// 不能移除群主
	targetRole, _ := s.chatRepo.GetMemberRole(ctx, chatID, targetID)
	if targetRole == string(model.MemberRoleOwner) {
		return errors.ErrNotAuthorized
	}

	err = s.chatRepo.RemoveMember(ctx, chatID, targetID)
	if err != nil {
		return err
	}

	// 广播成员离开事件
	s.wsHub.BroadcastToChat(chatID, outbound.WSMessage{
		Type: outbound.WSMsgTypeMemberLeft,
		Payload: map[string]interface{}{
			"chat_id": chatID,
			"user_id": targetID,
		},
	})
	return nil
}

// LeaveGroup 主动退出群聊
func (s *MessageService) LeaveGroup(ctx context.Context, chatID, userID string) error {
	// 不能让群主退出
	role, err := s.chatRepo.GetMemberRole(ctx, chatID, userID)
	if err != nil {
		return errors.ErrNotChatMember
	}
	if role == string(model.MemberRoleOwner) {
		return errors.ErrNotAuthorized
	}

	err = s.chatRepo.LeaveGroup(ctx, chatID, userID)
	if err != nil {
		return err
	}

	// 广播成员离开事件
	s.wsHub.BroadcastToChat(chatID, outbound.WSMessage{
		Type: outbound.WSMsgTypeMemberLeft,
		Payload: map[string]interface{}{
			"chat_id": chatID,
			"user_id": userID,
		},
	})
	return nil
}