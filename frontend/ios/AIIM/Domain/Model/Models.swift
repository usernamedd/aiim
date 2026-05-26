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

// MARK: - Contact Models

struct ContactRequest: Codable, Identifiable, Equatable {
    let id: String
    let fromUser: User
    let toUser: User
    let status: ContactRequestStatus
    let createdAt: Date
    let message: String?
    
    enum CodingKeys: String, CodingKey {
        case id, status, message
        case fromUser = "from_user"
        case toUser = "to_user"
        case createdAt = "created_at"
    }
}

enum ContactRequestStatus: String, Codable {
    case pending
    case accepted
    case rejected
}

struct ContactGroup: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var avatarURL: String?
    var memberCount: Int
    var members: [User]?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, name, members
        case avatarURL = "avatar_url"
        case memberCount = "member_count"
        case createdAt = "created_at"
    }
}

struct BlacklistedUser: Codable, Identifiable, Equatable {
    let id: String
    let user: User
    let blockedAt: Date
    let reason: String?
    
    enum CodingKeys: String, CodingKey {
        case id, user, reason
        case blockedAt = "blocked_at"
    }
}

// MARK: - Finance Models

struct Stock: Codable, Identifiable, Equatable {
    let id: String
    let symbol: String
    let name: String
    let currentPrice: Double
    let changePercent: Double
    let changeAmount: Double
    let volume: Int
    let marketCap: Double
    let high52Week: Double
    let low52Week: Double
    let history: [StockDataPoint]?
    
    enum CodingKeys: String, CodingKey {
        case id, symbol, name, volume, history
        case currentPrice = "current_price"
        case changePercent = "change_percent"
        case changeAmount = "change_amount"
        case marketCap = "market_cap"
        case high52Week = "high_52_week"
        case low52Week = "low_52_week"
    }
}

struct StockDataPoint: Codable, Identifiable, Equatable {
    var id: String { "\(timestamp)" }
    let timestamp: Int
    let open: Double
    let high: Double
    let low: Double
    let close: Double
    let volume: Int
}

struct Asset: Codable, Identifiable, Equatable {
    let id: String
    let type: AssetType
    let name: String
    let symbol: String?
    let amount: Double
    let value: Double
    let changePercent: Double
    
    enum CodingKeys: String, CodingKey {
        case id, type, name, symbol, amount, value
        case changePercent = "change_percent"
    }
}

enum AssetType: String, Codable {
    case stock
    case fund
    case bond
    case cash
    case crypto
}

struct Portfolio: Codable {
    let totalValue: Double
    let changeAmount: Double
    let changePercent: Double
    let assets: [Asset]
    
    enum CodingKeys: String, CodingKey {
        case totalValue = "total_value"
        case changeAmount = "change_amount"
        case changePercent = "change_percent"
        case assets
    }
}