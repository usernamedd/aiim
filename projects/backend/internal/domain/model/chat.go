package model

import "time"

// Chat 会话（两人或多人聊天）
type Chat struct {
	ID        string    // UUID
	Type      ChatType   // direct/group/channel
	Name      string    // 群名/频道名
	AvatarURL string    // 群头像
	OwnerID   string    // 群主/创建者
	CreatedAt time.Time
	UpdatedAt time.Time
}

// ChatType 会话类型
type ChatType string

const (
	ChatTypeDirect  ChatType = "direct"  // 私聊
	ChatTypeGroup   ChatType = "group"   // 群聊
	ChatTypeChannel ChatType = "channel" // 频道
)

// ChatMember 聊天室成员
type ChatMember struct {
	ID        string
	ChatID    string
	UserID    string
	Role      MemberRole // owner/admin/member
	JoinedAt  time.Time
	Nickname  string    // 在群里的昵称
}

// MemberRole 成员角色
type MemberRole string

const (
	MemberRoleOwner  MemberRole = "owner"
	MemberRoleAdmin MemberRole = "admin"
	MemberRoleMember MemberRole = "member"
)