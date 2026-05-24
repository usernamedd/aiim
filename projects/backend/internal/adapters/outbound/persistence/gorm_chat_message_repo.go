package persistence

import (
	"context"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
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
	rows, err := r.db.WithContext(ctx).
		Joins("JOIN chat_members ON chat_members.chat_id = chats.id").
		Where("chat_members.user_id = ?", userID).
		Order("chats.updated_at DESC").
		Limit(limit).
		Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var c ChatGORM
		if err := rows.Scan(&c); err == nil {
			chats = append(chats, toChatModel(&c))
		}
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