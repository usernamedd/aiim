package persistence

import (
	"context"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"

	"github.com/google/uuid"
)

type GORMMessageRepo struct {
	db *DB
}

func NewGORMMessageRepo(db *DB) *GORMMessageRepo { return &GORMMessageRepo{db: db} }

func (r *GORMMessageRepo) Save(ctx context.Context, msg *model.Message) error {
	return r.db.WithContext(ctx).Save(&MessageGORM{
		ID:       msg.ID,
		ChatID:   msg.ChatID,
		SenderID: msg.SenderID,
		Type:     string(msg.Content.Type),
		Text:     msg.Content.Text,
		Url:      msg.Content.Url,
		MimeType: msg.Content.MimeType,
		Size:     msg.Content.Size,
		Status:   string(msg.Status),
	}).Error
}

func (r *GORMMessageRepo) FindByID(ctx context.Context, id string) (*model.Message, error) {
	var m MessageGORM
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&m).Error; err != nil {
		return nil, errors.ErrMessageNotFound
	}
	return toMessageModel(&m), nil
}

func (r *GORMMessageRepo) FindByChatID(ctx context.Context, chatID string, beforeID string, limit int) ([]*model.Message, error) {
	query := r.db.WithContext(ctx).Where("chat_id = ?", chatID).Order("created_at DESC")
	if beforeID != "" {
		query = query.Where("id < ?", beforeID)
	}
	var msgs []*model.Message
	rows, err := query.Limit(limit).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var m MessageGORM
		if err := rows.Scan(&m); err == nil {
			msgs = append(msgs, toMessageModel(&m))
		}
	}
	return msgs, nil
}

func (r *GORMMessageRepo) UpdateStatus(ctx context.Context, id string, status model.MessageStatus) error {
	return r.db.WithContext(ctx).Model(&MessageGORM{}).Where("id = ?", id).Update("status", string(status)).Error
}

func (r *GORMMessageRepo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&MessageGORM{}, "id = ?", id).Error
}

func (r *GORMMessageRepo) CountUnread(ctx context.Context, userID, chatID string) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&MessageGORM{}).
		Where("chat_id = ? AND status != ?", chatID, "read").Count(&count).Error
	return int(count), err
}

func toMessageModel(m *MessageGORM) *model.Message {
	return &model.Message{
		ID:       m.ID,
		ChatID:   m.ChatID,
		SenderID: m.SenderID,
		Content: model.MessageContent{
			Type:    model.ContentType(m.Type),
			Text:    m.Text,
			Url:     m.Url,
			MimeType: m.MimeType,
			Size:    m.Size,
		},
		Status:    model.MessageStatus(m.Status),
		CreatedAt: m.CreatedAt,
	}
}

type GORMChatRepo struct {
	db *DB
}

func NewGORMChatRepo(db *DB) *GORMChatRepo { return &GORMChatRepo{db: db} }

func (r *GORMChatRepo) Save(ctx context.Context, chat *model.Chat) error {
	return r.db.WithContext(ctx).Save(&ChatGORM{
		ID:        chat.ID,
		Type:      string(chat.Type),
		Name:      chat.Name,
		AvatarURL: chat.AvatarURL,
		OwnerID:   chat.OwnerID,
		CreatedAt: chat.CreatedAt,
		UpdatedAt: chat.UpdatedAt,
	}).Error
}

func (r *GORMChatRepo) FindByID(ctx context.Context, id string) (*model.Chat, error) {
	var c ChatGORM
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&c).Error; err != nil {
		return nil, errors.ErrChatNotFound
	}
	return toChatModel(&c), nil
}

func (r *GORMChatRepo) FindDirectChatByMembers(ctx context.Context, userID1, userID2 string) (*model.Chat, error) {
	// 查找这两人之间的私聊
	var c ChatGORM
	err := r.db.WithContext(ctx).
		Joins("JOIN chat_members cm1 ON cm1.chat_id = chats.id AND cm1.user_id = ?", userID1).
		Joins("JOIN chat_members cm2 ON cm2.chat_id = chats.id AND cm2.user_id = ?", userID2).
		Where("chats.type = ?", "direct").
		First(&c).Error
	if err != nil {
		return nil, errors.ErrChatNotFound
	}
	return toChatModel(&c), nil
}

func (r *GORMChatRepo) ListByUser(ctx context.Context, userID string, limit int) ([]*model.Chat, error) {
	var chats []*model.Chat
	err := r.db.WithContext(ctx).
		Model(&ChatGORM{}).
		Joins("JOIN chat_members ON chat_members.chat_id = chats.id").
		Where("chat_members.user_id = ?", userID).
		Order("chats.updated_at DESC").
		Limit(limit).
		Find(&chats).Error
	if err != nil {
		return nil, err
	}
	return chats, nil
}

func (r *GORMChatRepo) AddMember(ctx context.Context, member *model.ChatMember) error {
	return r.db.WithContext(ctx).Save(&ChatMemberGORM{
		ID:       member.ID,
		ChatID:   member.ChatID,
		UserID:   member.UserID,
		Role:     string(member.Role),
		JoinedAt:  member.JoinedAt,
		Nickname: member.Nickname,
	}).Error
}

func (r *GORMChatRepo) RemoveMember(ctx context.Context, chatID, userID string) error {
	return r.db.WithContext(ctx).Delete(&ChatMemberGORM{}, "chat_id = ? AND user_id = ?", chatID, userID).Error
}

func (r *GORMChatRepo) GetMembers(ctx context.Context, chatID string) ([]*model.User, error) {
	type memberRow struct {
		UserID   string
		Username string
		Email    string
		Nickname string
	}
	var memberResults []memberRow
	err := r.db.WithContext(ctx).
		Table("chat_members").
		Select("chat_members.user_id, users.username, users.email, users.nickname").
		Joins("JOIN users ON users.id = chat_members.user_id").
		Where("chat_members.chat_id = ?", chatID).
		Scan(&memberResults).
		Error
	if err != nil {
		return nil, err
	}
	var users []*model.User
	for _, mr := range memberResults {
		users = append(users, &model.User{ID: mr.UserID, Username: mr.Username, Email: mr.Email, Nickname: mr.Nickname})
	}
	return users, nil
}

func (r *GORMChatRepo) IsMember(ctx context.Context, chatID, userID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&ChatMemberGORM{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).Count(&count).Error
	return count > 0, err
}

func (r *GORMChatRepo) GetMemberRole(ctx context.Context, chatID, userID string) (string, error) {
	var m ChatMemberGORM
	err := r.db.WithContext(ctx).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		First(&m).Error
	if err != nil {
		return "", err
	}
	return m.Role, nil
}

func (r *GORMChatRepo) AddMembers(ctx context.Context, chatID string, memberIDs []string, role string) error {
	for _, uid := range memberIDs {
		member := &model.ChatMember{
			ID:     uuid.New().String(),
			ChatID: chatID,
			UserID: uid,
			Role:   model.MemberRole(role),
		}
		if err := r.AddMember(ctx, member); err != nil {
			return err
		}
	}
	return nil
}

func (r *GORMChatRepo) LeaveGroup(ctx context.Context, chatID, userID string) error {
	return r.RemoveMember(ctx, chatID, userID)
}

func (r *GORMChatRepo) GetLastReadMessageID(ctx context.Context, chatID, userID string) (string, error) {
	var m ChatMemberGORM
	err := r.db.WithContext(ctx).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		First(&m).Error
	if err != nil {
		return "", err
	}
	if m.LastReadMessageID == nil {
		return "", nil
	}
	return *m.LastReadMessageID, nil
}

func (r *GORMChatRepo) UpdateLastReadMessageID(ctx context.Context, chatID, userID, messageID string) error {
	return r.db.WithContext(ctx).Model(&ChatMemberGORM{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		Update("last_read_message_id", messageID).Error
}

func (r *GORMChatRepo) CreateDirectChat(ctx context.Context, userID1, userID2 string) (*model.Chat, error) {
	// 先查是否已存在私聊
	existing, err := r.FindDirectChatByMembers(ctx, userID1, userID2)
	if err == nil {
		// 已存在，直接返回
		return existing, nil
	}

	// 不存在则创建
	chat := &model.Chat{
		ID:      uuid.New().String(),
		Type:    model.ChatTypeDirect,
		Name:    "私聊",
		OwnerID: userID1,
	}

	if err := r.Save(ctx, chat); err != nil {
		return nil, err
	}

	// 添加两人为成员
	member1 := &model.ChatMember{
		ID:     uuid.New().String(),
		ChatID: chat.ID,
		UserID: userID1,
		Role:   model.MemberRoleOwner,
	}
	member2 := &model.ChatMember{
		ID:     uuid.New().String(),
		ChatID: chat.ID,
		UserID: userID2,
		Role:   model.MemberRoleMember,
	}

	if err := r.AddMember(ctx, member1); err != nil {
		return nil, err
	}
	if err := r.AddMember(ctx, member2); err != nil {
		return nil, err
	}

	return chat, nil
}

func (r *GORMChatRepo) Search(ctx context.Context, keyword string, limit int) ([]*model.Chat, error) {
	var chats []*model.Chat
	err := r.db.WithContext(ctx).
		Model(&ChatGORM{}).
		Where("name LIKE ?", "%"+keyword+"%").
		Order("updated_at DESC").
		Limit(limit).
		Find(&chats).Error
	if err != nil {
		return nil, err
	}
	return chats, nil
}

func (r *GORMChatRepo) CreateGroup(ctx context.Context, name, ownerID string, memberIDs []string) (*model.Chat, error) {
	chat := &model.Chat{
		ID:      uuid.New().String(),
		Type:    model.ChatTypeGroup,
		Name:    name,
		OwnerID: ownerID,
	}

	if err := r.Save(ctx, chat); err != nil {
		return nil, err
	}

	// 添加群主为成员
	ownerMember := &model.ChatMember{
		ID:     uuid.New().String(),
		ChatID: chat.ID,
		UserID: ownerID,
		Role:   model.MemberRoleOwner,
	}
	if err := r.AddMember(ctx, ownerMember); err != nil {
		return nil, err
	}

	// 添加其他成员
	for _, mid := range memberIDs {
		member := &model.ChatMember{
			ID:     uuid.New().String(),
			ChatID: chat.ID,
			UserID: mid,
			Role:   model.MemberRoleMember,
		}
		if err := r.AddMember(ctx, member); err != nil {
			return nil, err
		}
	}

	return chat, nil
}

func (r *GORMChatRepo) UpdateGroupInfo(ctx context.Context, chatID, ownerID, name, avatarURL string) (*model.Chat, error) {
	chat, err := r.FindByID(ctx, chatID)
	if err != nil {
		return nil, err
	}
	if chat.OwnerID != ownerID {
		return nil, errors.ErrNotAuthorized
	}

	chat.Name = name
	chat.AvatarURL = avatarURL
	if err := r.Save(ctx, chat); err != nil {
		return nil, err
	}
	return chat, nil
}

func toChatModel(c *ChatGORM) *model.Chat {
	return &model.Chat{
		ID:        c.ID,
		Type:      model.ChatType(c.Type),
		Name:      c.Name,
		AvatarURL: c.AvatarURL,
		OwnerID:   c.OwnerID,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}