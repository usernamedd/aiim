import SwiftUI

@main
struct AIIMApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

// MARK: - App State
@MainActor
final class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    init() {
        // Check authentication status
        let storage = UserDefaultsStorage()
        if let user = storage.getCurrentUser(), storage.getAccessToken() != nil {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }
    
    func logout() {
        let storage = UserDefaultsStorage()
        storage.clearCredentials()
        isAuthenticated = false
        currentUser = nil
    }
}

// MARK: - Content View (Router)
struct ContentView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Group {
            if appState.isAuthenticated {
                MainTabView()
            } else {
                LoginPage()
            }
        }
    }
}