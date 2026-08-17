package persistence

import (
	"time"
)

// UserGORM GORM 用户模型（含 tag）
type UserGORM struct {
	ID        string `gorm:"primaryKey;type:varchar(36)"`
	Username  string `gorm:"uniqueIndex;type:varchar(50);not null"`
	Email     string `gorm:"uniqueIndex;type:varchar(255);not null"`
	Password  string `gorm:"not null"`
	Nickname  string `gorm:"type:varchar(100)"`
	AvatarURL string `gorm:"type:text"`
	Status    string `gorm:"type:varchar(20);default:offline"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (UserGORM) TableName() string { return "users" }

// SessionGORM GORM 会话模型
type SessionGORM struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)"`
	UserID    string    `gorm:"index;type:varchar(36);not null"`
	TokenHash string    `gorm:"uniqueIndex;type:varchar(64);not null"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
	IpAddress string `gorm:"type:varchar(45)"`
	UserAgent string `gorm:"type:text"`
}

func (SessionGORM) TableName() string { return "sessions" }

// ChatGORM GORM 聊天室模型
type ChatGORM struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)"`
	Type      string    `gorm:"type:varchar(20);not null"`
	Name      string    `gorm:"type:varchar(100)"`
	AvatarURL string    `gorm:"type:text"`
	OwnerID   string    `gorm:"type:varchar(36)"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (ChatGORM) TableName() string { return "chats" }

// ChatMemberGORM GORM 聊天室成员模型
type ChatMemberGORM struct {
	ID                 string    `gorm:"primaryKey;type:varchar(36)"`
	ChatID             string    `gorm:"uniqueIndex:idx_chat_user;type:varchar(36);not null"`
	UserID             string    `gorm:"uniqueIndex:idx_chat_user;type:varchar(36);not null"`
	Role               string    `gorm:"type:varchar(20);default:member"`
	JoinedAt           time.Time
	Nickname           string    `gorm:"type:varchar(100)"`
	LastReadMessageID  *string   `gorm:"type:varchar(36)"` // 最后已读的消息ID
}

func (ChatMemberGORM) TableName() string { return "chat_members" }

// MessageGORM GORM 消息模型
type MessageGORM struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)"`
	ChatID    string    `gorm:"index;type:varchar(36);not null"`
	SenderID  string    `gorm:"index;type:varchar(36);not null"`
	Type      string    `gorm:"type:varchar(20);not null"`
	Text      string    `gorm:"type:text"`
	Url       string    `gorm:"type:text"`
	MimeType  string    `gorm:"type:varchar(100)"`
	Size      int64     `gorm:"default:0"`
	Status    string    `gorm:"type:varchar(20);default:sent"`
	CreatedAt time.Time
}

func (MessageGORM) TableName() string { return "messages" }

// BlockListGORM GORM 黑名单模型
type BlockListGORM struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)"`
	UserID    string    `gorm:"uniqueIndex:idx_block_user;type:varchar(36);not null"`
	BlockedID string    `gorm:"uniqueIndex:idx_block_user;type:varchar(36);not null"`
	CreatedAt time.Time
}

func (BlockListGORM) TableName() string { return "block_list" }

// ContactGORM GORM 联系人模型
type ContactGORM struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)"`
	UserID    string    `gorm:"uniqueIndex:idx_contact_user;type:varchar(36);not null"`
	ContactID string    `gorm:"uniqueIndex:idx_contact_user;type:varchar(36);not null"`
	Remark    string    `gorm:"type:varchar(100)"`
	CreatedAt time.Time
}

func (ContactGORM) TableName() string { return "contacts" }