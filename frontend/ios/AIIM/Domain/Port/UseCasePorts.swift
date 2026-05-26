import Foundation

// MARK: - Auth Ports (Driving)
protocol AuthUseCasePort {
    func login(username: String, password: String) async throws -> User
    func register(username: String, email: String, password: String, nickname: String?) async throws -> User
    func refreshToken(refreshToken: String) async throws -> (accessToken: String, refreshToken: String, expiresAt: Int64)
    func logout(sessionID: String) async throws
    func getCurrentUser() -> User?
    func isAuthenticated() -> Bool
}

// MARK: - User Ports (Driving)
protocol UserUseCasePort {
    func searchUsers(keyword: String, limit: Int, offset: Int) async throws -> [User]
    func getUser(id: String) async throws -> User
    func updateProfile(nickname: String?, avatarURL: String?) async throws -> User
}

// MARK: - Chat Ports (Driving)
protocol ChatUseCasePort {
    func getRecentChats(limit: Int) async throws -> [Chat]
    func getChatDetail(chatID: String) async throws -> (chat: Chat, members: [User])
    func getMessages(chatID: String, limit: Int, before: String?) async throws -> [Message]
    func searchChats(query: String, limit: Int) async throws -> [Chat]
    func createDirectChat(targetUserID: String) async throws -> Chat
    func createGroup(name: String, memberIDs: [String]) async throws -> Chat
    func updateGroupInfo(chatID: String, name: String?, avatarURL: String?) async throws -> Chat
    func addMembers(chatID: String, memberIDs: [String]) async throws
    func removeMember(chatID: String, userID: String) async throws
    func leaveGroup(chatID: String) async throws
}

// MARK: - Message Ports (Driving)
protocol MessageUseCasePort {
    func sendMessage(chatID: String, content: String?, mediaURL: String?, type: MessageType) async throws -> Message
    func subscribeToMessages(chatID: String, handler: @escaping (Message) -> Void)
    func unsubscribeFromMessages(chatID: String)
}

// MARK: - Storage Port (Driven)
protocol StoragePort {
    func saveAccessToken(_ token: String)
    func getAccessToken() -> String?
    func saveRefreshToken(_ token: String)
    func getRefreshToken() -> String?
    func saveCurrentUser(_ user: User)
    func getCurrentUser() -> User?
    func clearCredentials()
}