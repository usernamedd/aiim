import Foundation

// MARK: - User Model
struct User: Codable, Identifiable, Equatable {
    let id: String
    let username: String
    let email: String
    var nickname: String?
    var avatarURL: String?
    var status: String?
    
    enum CodingKeys: String, CodingKey {
        case id, username, email, nickname, status
        case avatarURL = "avatar_url"
    }
}

// MARK: - Auth Models
struct LoginRequest: Codable {
    let username: String
    let password: String
}

struct RegisterRequest: Codable {
    let username: String
    let email: String
    let password: String
    let nickname: String?
}

struct AuthResponse: Codable {
    let user: User
    let accessToken: String
    let refreshToken: String
    let expiresAt: Int64
    
    enum CodingKeys: String, CodingKey {
        case user
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }
}

struct RefreshRequest: Codable {
    let refreshToken: String
    
    enum CodingKeys: String, CodingKey {
        case refreshToken = "refresh_token"
    }
}

struct RefreshResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Int64
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }
}

// MARK: - Chat Models
struct Chat: Codable, Identifiable, Equatable {
    let id: String
    var name: String?
    var avatarURL: String?
    let type: ChatType
    var lastMessage: String?
    var lastMessageTime: Date?
    var unreadCount: Int
    var members: [User]?
    var isPinned: Bool = false
    var isMuted: Bool = false
    var isOnline: Bool = false
    var lastMessageSenderName: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, type, members
        case avatarURL = "avatar_url"
        case lastMessage = "last_message"
        case lastMessageTime = "last_message_time"
        case unreadCount = "unread_count"
    }
    
    var displayName: String {
        if let name = name {
            return name
        }
        if let firstMember = members?.first {
            return firstMember.nickname ?? firstMember.username
        }
        return "Unknown Chat"
    }
}

enum ChatType: String, Codable {
    case direct
    case group
}

// MARK: - Message Model
struct Message: Codable, Identifiable, Equatable {
    let id: String
    let chatID: String
    let senderID: String
    let senderName: String
    var content: String?
    var mediaURL: String?
    let type: MessageType
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, content, type, createdAt
        case chatID = "chat_id"
        case senderID = "sender_id"
        case senderName = "sender_name"
        case mediaURL = "media_url"
    }
}

enum MessageType: String, Codable {
    case text
    case image
    case file
    case audio
}

// MARK: - API Response wrapper
struct APIResponse<T: Codable>: Codable {
    let code: Int
    let message: String
    let data: T?
}

struct APIError: Error, LocalizedError {
    let code: Int
    let message: String
    
    var errorDescription: String? { message }
}

// MARK: - Pagination
struct PaginatedResponse<T: Codable>: Codable {
    let items: [T]
    let total: Int
    let hasMore: Bool
    
    enum CodingKeys: String, CodingKey {
        case items, total
        case hasMore = "has_more"
    }
}