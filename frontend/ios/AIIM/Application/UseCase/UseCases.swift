import Foundation

final class AuthUseCase: AuthUseCasePort {
    private let api: APIClient
    private let storage: StoragePort
    private var currentUser: User?
    
    init(api: APIClient = .shared, storage: StoragePort = Storage) {
        self.api = api
        self.storage = storage
        self.currentUser = storage.getCurrentUser()
    }
    
    func login(username: String, password: String) async throws -> User {
        let response = try await api.login(username: username, password: password)
        
        storage.saveAccessToken(response.accessToken)
        storage.saveRefreshToken(response.refreshToken)
        storage.saveCurrentUser(response.user)
        storage.saveSessionID(UUID().uuidString) // Generate session ID for logout
        
        currentUser = response.user
        return response.user
    }
    
    func register(username: String, email: String, password: String, nickname: String?) async throws -> User {
        return try await api.register(username: username, email: email, password: password, nickname: nickname)
    }
    
    func refreshToken(refreshToken: String) async throws -> (accessToken: String, refreshToken: String, expiresAt: Int64) {
        let response = try await api.refresh(refreshToken: refreshToken)
        storage.saveAccessToken(response.accessToken)
        storage.saveRefreshToken(response.refreshToken)
        return (response.accessToken, response.refreshToken, response.expiresAt)
    }
    
    func logout(sessionID: String) async throws {
        try await api.logout(sessionID: sessionID)
        storage.clearCredentials()
        currentUser = nil
    }
    
    func getCurrentUser() -> User? {
        return currentUser
    }
    
    func isAuthenticated() -> Bool {
        return storage.getAccessToken() != nil && currentUser != nil
    }
}

final class UserUseCase: UserUseCasePort {
    private let api: APIClient
    
    init(api: APIClient = .shared) {
        self.api = api
    }
    
    func searchUsers(keyword: String, limit: Int = 20, offset: Int = 0) async throws -> [User] {
        return try await api.searchUsers(keyword: keyword, limit: limit, offset: offset)
    }
    
    func getUser(id: String) async throws -> User {
        return try await api.getUser(id: id)
    }
    
    func updateProfile(nickname: String?, avatarURL: String?) async throws -> User {
        return try await api.updateProfile(nickname: nickname, avatarURL: avatarURL)
    }
}

final class ChatUseCase: ChatUseCasePort {
    private let api: APIClient
    
    init(api: APIClient = .shared) {
        self.api = api
    }
    
    func getRecentChats(limit: Int = 20) async throws -> [Chat] {
        return try await api.getRecentChats(limit: limit)
    }
    
    func getChatDetail(chatID: String) async throws -> (chat: Chat, members: [User]) {
        return try await api.getChatDetail(chatID: chatID)
    }
    
    func getMessages(chatID: String, limit: Int = 20, before: String? = nil) async throws -> [Message] {
        return try await api.getMessages(chatID: chatID, limit: limit, before: before)
    }
    
    func searchChats(query: String, limit: Int = 20) async throws -> [Chat] {
        return try await api.searchChats(query: query, limit: limit)
    }
    
    func createDirectChat(targetUserID: String) async throws -> Chat {
        return try await api.createDirectChat(targetUserID: targetUserID)
    }
    
    func createGroup(name: String, memberIDs: [String]) async throws -> Chat {
        return try await api.createGroup(name: name, memberIDs: memberIDs)
    }
    
    func updateGroupInfo(chatID: String, name: String?, avatarURL: String?) async throws -> Chat {
        return try await api.updateGroupInfo(chatID: chatID, name: name, avatarURL: avatarURL)
    }
    
    func addMembers(chatID: String, memberIDs: [String]) async throws {
        try await api.addMembers(chatID: chatID, memberIDs: memberIDs)
    }
    
    func removeMember(chatID: String, userID: String) async throws {
        try await api.removeMember(chatID: chatID, userID: userID)
    }
    
    func leaveGroup(chatID: String) async throws {
        try await api.leaveGroup(chatID: chatID)
    }
}