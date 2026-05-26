import Foundation

enum NetworkError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case serverError(Int, String)
    case unauthorized
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .noData: return "No data received"
        case .decodingError(let err): return "Decoding error: \(err.localizedDescription)"
        case .serverError(let code, let msg): return "Server error (\(code)): \(msg)"
        case .unauthorized: return "Unauthorized"
        case .networkError(let err): return "Network error: \(err.localizedDescription)"
        }
    }
}

final class APIClient {
    static let shared = APIClient()
    
    private let baseURL: String
    private let session: URLSession
    private var accessToken: String?
    private var refreshToken: String?
    
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .secondsSince1970
        return decoder
    }()
    
    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .secondsSince1970
        return encoder
    }()
    
    private init() {
        // Backend runs on localhost:8080
        self.baseURL = "http://localhost:8080/api/v1"
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
        
        // Load stored tokens
        self.accessToken = UserDefaults.standard.string(forKey: "access_token")
        self.refreshToken = UserDefaults.standard.string(forKey: "refresh_token")
    }
    
    func setTokens(access: String, refresh: String) {
        self.accessToken = access
        UserDefaults.standard.set(access, forKey: "access_token")
        UserDefaults.standard.set(refresh, forKey: "refresh_token")
    }
    
    func clearTokens() {
        self.accessToken = nil
        self.refreshToken = nil
        UserDefaults.standard.removeObject(forKey: "access_token")
        UserDefaults.standard.removeObject(forKey: "refresh_token")
    }
    
    // MARK: - Auth Endpoints
    func login(username: String, password: String) async throws -> AuthResponse {
        let request = LoginRequest(username: username, password: password)
        return try await post(endpoint: "/auth/login", body: request, authenticated: false)
    }
    
    func register(username: String, email: String, password: String, nickname: String?) async throws -> User {
        let request = RegisterRequest(username: username, email: email, password: password, nickname: nickname)
        let response: EmptyResponseWithData<RegisterResponse> = try await post(endpoint: "/auth/register", body: request, authenticated: false)
        return response.data.user
    }
    
    func refresh(refreshToken: String) async throws -> RefreshResponse {
        let request = RefreshRequest(refreshToken: refreshToken)
        return try await post(endpoint: "/auth/refresh", body: request, authenticated: false)
    }
    
    func logout(sessionID: String) async throws {
        struct LogoutRequest: Codable { let sessionID: String; enum CodingKeys: String, CodingKey { case sessionID = "session_id" } }
        let _: EmptyResponse = try await post(endpoint: "/auth/logout", body: LogoutRequest(sessionID: sessionID))
    }
    
    // MARK: - User Endpoints
    func searchUsers(keyword: String, limit: Int = 20, offset: Int = 0) async throws -> [User] {
        let response: EmptyResponseWithData<UsersResponse> = try await get(endpoint: "/users/search", queryItems: [
            URLQueryItem(name: "keyword", value: keyword),
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "offset", value: "\(offset)")
        ])
        return response.data.users
    }
    
    func getUser(id: String) async throws -> User {
        let response: EmptyResponseWithData<UserResponse> = try await get(endpoint: "/users/\(id)")
        return response.data.user
    }
    
    func updateProfile(nickname: String?, avatarURL: String?) async throws -> User {
        struct UpdateReq: Codable { let nickname: String?; let avatarURL: String?; enum CodingKeys: String, CodingKey { case nickname; case avatarURL = "avatar_url" } }
        let response: EmptyResponseWithData<UserResponse> = try await put(endpoint: "/users/profile", body: UpdateReq(nickname: nickname, avatarURL: avatarURL))
        return response.data.user
    }
    
    // MARK: - Chat Endpoints
    func getRecentChats(limit: Int = 20) async throws -> [Chat] {
        let response: EmptyResponseWithData<ChatsResponse> = try await get(endpoint: "/chats", queryItems: [
            URLQueryItem(name: "limit", value: "\(limit)")
        ])
        return response.data.chats
    }
    
    func getChatDetail(chatID: String) async throws -> (chat: Chat, members: [User]) {
        let response: EmptyResponseWithData<ChatDetailResponse> = try await get(endpoint: "/chats/\(chatID)")
        return (response.data.chat, response.data.members)
    }
    
    func getMessages(chatID: String, limit: Int = 20, before: String? = nil) async throws -> [Message] {
        var queryItems = [URLQueryItem(name: "limit", value: "\(limit)")]
        if let before = before {
            queryItems.append(URLQueryItem(name: "before", value: before))
        }
        let response: EmptyResponseWithData<MessagesResponse> = try await get(endpoint: "/chats/\(chatID)/messages", queryItems: queryItems)
        return response.data.messages
    }
    
    func searchChats(query: String, limit: Int = 20) async throws -> [Chat] {
        let response: EmptyResponseWithData<ChatsResponse> = try await get(endpoint: "/chats/search", queryItems: [
            URLQueryItem(name: "q", value: query),
            URLQueryItem(name: "limit", value: "\(limit)")
        ])
        return response.data.chats
    }
    
    func createDirectChat(targetUserID: String) async throws -> Chat {
        struct CreateDirectReq: Codable { let userID: String; enum CodingKeys: String, CodingKey { case userID = "user_id" } }
        let response: EmptyResponseWithData<ChatResponse> = try await post(endpoint: "/chats/direct", body: CreateDirectReq(userID: targetUserID))
        return response.data.chat
    }
    
    func createGroup(name: String, memberIDs: [String]) async throws -> Chat {
        struct CreateGroupReq: Codable { let name: String; let memberIDs: [String]; enum CodingKeys: String, CodingKey { case name; case memberIDs = "member_ids" } }
        let response: EmptyResponseWithData<ChatResponse> = try await post(endpoint: "/chats/group", body: CreateGroupReq(name: name, memberIDs: memberIDs))
        return response.data.chat
    }
    
    func updateGroupInfo(chatID: String, name: String?, avatarURL: String?) async throws -> Chat {
        struct UpdateGroupReq: Codable { let name: String?; let avatarURL: String?; enum CodingKeys: String, CodingKey { case name; case avatarURL = "avatar_url" } }
        let response: EmptyResponseWithData<ChatResponse> = try await put(endpoint: "/chats/\(chatID)", body: UpdateGroupReq(name: name, avatarURL: avatarURL))
        return response.data.chat
    }
    
    func addMembers(chatID: String, memberIDs: [String]) async throws {
        struct AddMembersReq: Codable { let memberIDs: [String]; enum CodingKeys: String, CodingKey { case memberIDs = "member_ids" } }
        let _: EmptyResponse = try await post(endpoint: "/chats/\(chatID)/members", body: AddMembersReq(memberIDs: memberIDs))
    }
    
    func removeMember(chatID: String, userID: String) async throws {
        let _: EmptyResponse = try await delete(endpoint: "/chats/\(chatID)/members/\(userID)")
    }
    
    func leaveGroup(chatID: String) async throws {
        let _: EmptyResponse = try await delete(endpoint: "/chats/\(chatID)/members/me")
    }
    
    // MARK: - Private Helpers
    private func get<T: Codable>(endpoint: String, queryItems: [URLQueryItem] = []) async throws -> T {
        return try await request(method: "GET", endpoint: endpoint, queryItems: queryItems)
    }
    
    private func post<T: Codable>(endpoint: String, body: Encodable, authenticated: Bool = true) async throws -> T {
        return try await request(method: "POST", endpoint: endpoint, body: body, authenticated: authenticated)
    }
    
    private func put<T: Codable>(endpoint: String, body: Encodable, authenticated: Bool = true) async throws -> T {
        return try await request(method: "PUT", endpoint: endpoint, body: body, authenticated: authenticated)
    }
    
    private func delete<T: Codable>(endpoint: String) async throws -> T {
        return try await request(method: "DELETE", endpoint: endpoint)
    }
    
    private func request<T: Codable>(
        method: String,
        endpoint: String,
        queryItems: [URLQueryItem] = [],
        body: (any Encodable)? = nil,
        authenticated: Bool = true
    ) async throws -> T {
        var components = URLComponents(string: baseURL + endpoint)
        if !queryItems.isEmpty {
            components?.queryItems = queryItems
        }
        
        guard let url = components?.url else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if authenticated, let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try encoder.encode(body)
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.noData
            }
            
            if httpResponse.statusCode == 401 {
                // Try to refresh token
                if authenticated, let refresh = refreshToken {
                    do {
                        let refreshResponse = try await refresh(refreshToken: refresh)
                        setTokens(access: refreshResponse.accessToken, refresh: refreshResponse.refreshToken)
                        return try await self.request(method: method, endpoint: endpoint, queryItems: queryItems, body: body, authenticated: authenticated)
                    } catch {
                        clearTokens()
                        throw NetworkError.unauthorized
                    }
                }
                throw NetworkError.unauthorized
            }
            
            if httpResponse.statusCode >= 400 {
                if let errorResponse = try? decoder.decode(APIResponse<String>.self, from: data) {
                    throw NetworkError.serverError(httpResponse.statusCode, errorResponse.message)
                }
                throw NetworkError.serverError(httpResponse.statusCode, "Unknown error")
            }
            
            return try decoder.decode(T.self, from: data)
        } catch let error as NetworkError {
            throw error
        } catch let error as DecodingError {
            throw NetworkError.decodingError(error)
        } catch {
            throw NetworkError.networkError(error)
        }
    }
}

// MARK: - Response Types
private struct EmptyResponse: Codable { let code: Int; let message: String }
private struct EmptyResponseWithData<T: Codable>: Codable { let code: Int; let message: String; let data: T }

private struct RegisterResponse: Codable { let userID: String; let username: String; let email: String; let nickname: String?; enum CodingKeys: String, CodingKey { case userID = "user_id"; case username; case email; case nickname } }
private struct UsersResponse: Codable { let users: [User]; let total: Int }
private struct UserResponse: Codable { let user: User }
private struct ChatsResponse: Codable { let chats: [Chat]; let total: Int }
private struct ChatResponse: Codable { let chat: Chat }
private struct ChatDetailResponse: Codable { let chat: Chat; let members: [User] }
private struct MessagesResponse: Codable { let messages: [Message]; let hasMore: Bool; enum CodingKeys: String, CodingKey { case messages; case hasMore = "has_more" } }