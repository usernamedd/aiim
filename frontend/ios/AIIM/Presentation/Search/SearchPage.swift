import SwiftUI

// MARK: - P20: Search Page (Users & Chats)
struct SearchPage: View {
    @State private var searchText = ""
    @State private var searchScope: SearchScope = .all
    @StateObject private var viewModel = SearchViewModel()
    
    enum SearchScope: String, CaseIterable {
        case all = "All"
        case users = "Users"
        case chats = "Chats"
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Scope Picker
                Picker("Search Scope", selection: $searchScope) {
                    ForEach(SearchScope.allCases, id: \.self) { scope in
                        Text(scope.rawValue).tag(scope)
                    }
                }
                .pickerStyle(.segmented)
                .padding()
                
                // Results
                Group {
                    if searchText.isEmpty {
                        ContentUnavailableView(
                            "Search",
                            systemImage: "magnifyingglass",
                            description: Text("Search for users or chats")
                        )
                    } else if viewModel.isSearching {
                        ProgressView("Searching...")
                    } else if viewModel.isEmpty {
                        ContentUnavailableView(
                            "No Results",
                            systemImage: "magnifyingglass",
                            description: Text("Try different keywords")
                        )
                    } else {
                        List {
                            if searchScope == .all || searchScope == .users {
                                Section("Users") {
                                    ForEach(viewModel.users) { user in
                                        NavigationLink(destination: UserProfilePage(userID: user.id)) {
                                            UserRowView(user: user)
                                        }
                                    }
                                }
                            }
                            
                            if searchScope == .all || searchScope == .chats {
                                Section("Chats") {
                                    ForEach(viewModel.chats) { chat in
                                        NavigationLink(destination: ChatDetailPage(chatID: chat.id, chatName: chat.name ?? "Chat")) {
                                            ChatRowView(chat: chat)
                                        }
                                    }
                                }
                            }
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("Search")
            .searchable(text: $searchText, prompt: "Search...")
            .onChange(of: searchText) { _, newValue in
                Task { await viewModel.search(query: newValue, scope: searchScope) }
            }
            .onChange(of: searchScope) { _, _ in
                Task { await viewModel.search(query: searchText, scope: searchScope) }
            }
        }
    }
}

// MARK: - Search ViewModel
@MainActor
final class SearchViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var chats: [Chat] = []
    @Published var isSearching = false
    @Published var isEmpty = true
    
    private let userUseCase = UserUseCase()
    private let chatUseCase = ChatUseCase()
    
    func search(query: String, scope: SearchPage.SearchScope) async {
        guard !query.isEmpty else {
            users = []
            chats = []
            isEmpty = true
            return
        }
        
        isSearching = true
        
        do {
            if scope == .all || scope == .users {
                users = try await userUseCase.searchUsers(keyword: query, limit: 20)
            }
            if scope == .all || scope == .chats {
                chats = try await chatUseCase.searchChats(query: query, limit: 20)
            }
        } catch {
            // Handle error silently
        }
        
        isEmpty = users.isEmpty && chats.isEmpty
        isSearching = false
    }
}

// MARK: - P21: User Profile Page
struct UserProfilePage: View {
    let userID: String
    @State private var user: User?
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var showingChat = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if isLoading {
                    ProgressView()
                        .padding(.top, 50)
                } else if let user = user {
                    // Avatar
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 100, height: 100)
                        .overlay {
                            Text(String((user.nickname ?? user.username).prefix(1)).uppercased())
                                .font(.largeTitle)
                                .foregroundColor(.blue)
                        }
                    
                    // Name
                    VStack(spacing: 4) {
                        Text(user.nickname ?? user.username)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("@\(user.username)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    // Actions
                    HStack(spacing: 20) {
                        Button(action: { showingChat = true }) {
                            VStack {
                                Image(systemName: "message.fill")
                                    .font(.title2)
                                Text("Message")
                                    .font(.caption)
                            }
                            .foregroundColor(.blue)
                        }
                        
                        Button(action: {}) {
                            VStack {
                                Image(systemName: "person.badge.plus")
                                    .font(.title2)
                                Text("Add Friend")
                                    .font(.caption)
                            }
                            .foregroundColor(.blue)
                        }
                    }
                    .padding(.top, 8)
                    
                    // Info Section
                    VStack(alignment: .leading, spacing: 16) {
                        ProfileInfoRow(icon: "envelope", label: "Email", value: user.email)
                        if let status = user.status {
                            ProfileInfoRow(icon: "circle.fill", label: "Status", value: status)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                } else if let error = errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                }
            }
            .padding()
        }
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadUser()
        }
        .sheet(isPresented: $showingChat) {
            if let user = user {
                // Create direct chat and navigate
                Task {
                    do {
                        let chatUseCase = ChatUseCase()
                        let chat = try await chatUseCase.createDirectChat(targetUserID: user.id)
                        showingChat = false
                        // Could navigate to chat detail here
                    } catch {
                        errorMessage = error.localizedDescription
                    }
                }
            }
        }
    }
    
    private func loadUser() async {
        isLoading = true
        do {
            user = try await UserUseCase().getUser(id: userID)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - Profile Info Row
struct ProfileInfoRow: View {
    let icon: String
    let label: String
    let value: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.body)
            }
            
            Spacer()
        }
    }
}

#Preview {
    NavigationStack {
        SearchPage()
    }
}