import SwiftUI

// MARK: - P10: Chat List Page
struct ChatListPage: View {
    @StateObject private var viewModel = ChatListViewModel()
    @State private var showingNewChat = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.chats.isEmpty {
                    ProgressView("Loading chats...")
                } else if viewModel.chats.isEmpty {
                    ContentUnavailableView(
                        "No Chats Yet",
                        systemImage: "bubble.left.and.bubble.right",
                        description: Text("Start a conversation by searching for users")
                    )
                } else {
                    List(viewModel.chats) { chat in
                        NavigationLink(value: chat) {
                            ChatRowView(chat: chat)
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await viewModel.loadChats()
                    }
                }
            }
            .navigationTitle("Chats")
            .navigationDestination(for: Chat.self) { chat in
                ChatDetailPage(chatID: chat.id, chatName: chat.name ?? "Chat")
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showingNewChat = true }) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .sheet(isPresented: $showingNewChat) {
                NewChatPage(onSelectUser: { user in
                    showingNewChat = false
                    Task {
                        if let chat = try? await viewModel.startDirectChat(with: user.id) {
                            // Navigate to the new chat
                        }
                    }
                })
            }
            .task {
                await viewModel.loadChats()
            }
        }
    }
}

// MARK: - Chat Row View
struct ChatRowView: View {
    let chat: Chat
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            Circle()
                .fill(Color.blue.opacity(0.2))
                .frame(width: 50, height: 50)
                .overlay {
                    if let name = chat.name ?? chat.members?.first?.nickname ?? chat.members?.first?.username {
                        Text(String(name.prefix(1)).uppercased())
                            .font(.headline)
                            .foregroundColor(.blue)
                    } else {
                        Image(systemName: "person.fill")
                            .foregroundColor(.blue)
                    }
                }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(chat.name ?? chat.members?.first?.nickname ?? "Unknown")
                        .font(.headline)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    if let time = chat.lastMessageTime {
                        Text(time, style: .relative)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                HStack {
                    if let lastMessage = chat.lastMessage {
                        Text(lastMessage)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                    
                    Spacer()
                    
                    if chat.unreadCount > 0 {
                        Text("\(chat.unreadCount)")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.blue)
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - New Chat Page
struct NewChatPage: View {
    @Environment(\.dismiss) private var dismiss
    let onSelectUser: (User) -> Void
    @State private var searchText = ""
    @StateObject private var searchVM = UserSearchViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if searchText.isEmpty {
                    ContentUnavailableView(
                        "Search for Users",
                        systemImage: "magnifyingglass",
                        description: Text("Enter a username or email to find people")
                    )
                } else if searchVM.isSearching {
                    ProgressView()
                } else if searchVM.users.isEmpty {
                    ContentUnavailableView(
                        "No Users Found",
                        systemImage: "person.slash",
                        description: Text("Try a different search term")
                    )
                } else {
                    List(searchVM.users) { user in
                        Button(action: { onSelectUser(user) }) {
                            UserRowView(user: user)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .navigationTitle("New Chat")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Search users...")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onChange(of: searchText) { _, newValue in
                Task {
                    await searchVM.search(keyword: newValue)
                }
            }
        }
    }
}

// MARK: - User Row View
struct UserRowView: View {
    let user: User
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color.blue.opacity(0.2))
                .frame(width: 44, height: 44)
                .overlay {
                    Text(String((user.nickname ?? user.username).prefix(1)).uppercased())
                        .font(.headline)
                        .foregroundColor(.blue)
                }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(user.nickname ?? user.username)
                    .font(.headline)
                Text("@\(user.username)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

// MARK: - ViewModels
@MainActor
final class ChatListViewModel: ObservableObject {
    @Published var chats: [Chat] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let chatUseCase: ChatUseCase
    
    init(chatUseCase: ChatUseCase = ChatUseCase()) {
        self.chatUseCase = chatUseCase
    }
    
    func loadChats() async {
        isLoading = true
        do {
            chats = try await chatUseCase.getRecentChats(limit: 50)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
    
    func startDirectChat(with userID: String) async throws -> Chat {
        return try await chatUseCase.createDirectChat(targetUserID: userID)
    }
}

@MainActor
final class UserSearchViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isSearching = false
    
    private let userUseCase: UserUseCase
    
    init(userUseCase: UserUseCase = UserUseCase()) {
        self.userUseCase = userUseCase
    }
    
    func search(keyword: String) async {
        guard !keyword.isEmpty else {
            users = []
            return
        }
        
        isSearching = true
        do {
            users = try await userUseCase.searchUsers(keyword: keyword, limit: 20)
        } catch {
            users = []
        }
        isSearching = false
    }
}

#Preview {
    ChatListPage()
}