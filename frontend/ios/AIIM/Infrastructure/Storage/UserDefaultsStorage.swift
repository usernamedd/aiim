import Foundation

final class UserDefaultsStorage: StoragePort {
    private let defaults = UserDefaults.standard
    
    private enum Keys {
        static let accessToken = "access_token"
        static let refreshToken = "refresh_token"
        static let currentUser = "current_user"
        static let sessionID = "session_id"
    }
    
    func saveAccessToken(_ token: String) {
        defaults.set(token, forKey: Keys.accessToken)
    }
    
    func getAccessToken() -> String? {
        defaults.string(forKey: Keys.accessToken)
    }
    
    func saveRefreshToken(_ token: String) {
        defaults.set(token, forKey: Keys.refreshToken)
    }
    
    func getRefreshToken() -> String? {
        defaults.string(forKey: Keys.refreshToken)
    }
    
    func saveCurrentUser(_ user: User) {
        if let data = try? JSONEncoder().encode(user) {
            defaults.set(data, forKey: Keys.currentUser)
        }
    }
    
    func getCurrentUser() -> User? {
        guard let data = defaults.data(forKey: Keys.currentUser) else { return nil }
        return try? JSONDecoder().decode(User.self, from: data)
    }
    
    func clearCredentials() {
        defaults.removeObject(forKey: Keys.accessToken)
        defaults.removeObject(forKey: Keys.refreshToken)
        defaults.removeObject(forKey: Keys.currentUser)
        defaults.removeObject(forKey: Keys.sessionID)
    }
    
    func saveSessionID(_ sessionID: String) {
        defaults.set(sessionID, forKey: Keys.sessionID)
    }
    
    func getSessionID() -> String? {
        defaults.string(forKey: Keys.sessionID)
    }
}

// Global storage instance
let Storage = UserDefaultsStorage()