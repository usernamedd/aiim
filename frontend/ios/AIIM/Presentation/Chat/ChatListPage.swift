import SwiftUI

// MARK: - P10: Chat List Page
struct ChatListPage: View {
    @StateObject private var viewModel = ChatListViewModel()
    @State private var showingNewChat = false
    @State private var showingNewGroup = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.chats.isEmpty {
                    loadingView
                } else if viewModel.chats.isEmpty {
                    emptyStateView
                } else {
                    chatListView
                }
            }
            .navigationTitle("Chats")
            .navigationDestination(for: Chat.self) { chat in
                ChatDetailPage(chatID: chat.id, chatName: chat.name ?? "Chat")
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        Button(action: { showingNewChat = true }) {
                            Label("New Chat", systemImage: "person.fill")
                        }
                        Button(action: { showingNewGroup = true }) {
                            Label("New Group", systemImage: "person.3.fill")
                        }
                    } label: {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .sheet(isPresented: $showingNewChat) {
                NewChatPage(onSelectUser: { user in
                    showingNewChat = false
                    Task {
                        if let chat = try? await viewModel.startDirectChat(with: user.id) {
                            // Chat created, list will refresh
                        }
                    }
                })
            }
            .sheet(isPresented: $showingNewGroup) {
                NewGroupPage(onCreateGroup: { name, memberIDs in
                    showingNewGroup = false
                    Task {
                        if let _ = try? await viewModel.createGroup(name: name, memberIDs: memberIDs) {
                            // Group created, list will refresh
                        }
                    }
                })
            }
            .task {
                await viewModel.loadChats()
            }
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Loading chats...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
    
    private var emptyStateView: some View {
        ContentUnavailableView {
            Label("No Chats Yet", systemImage: "bubble.left.and.bubble.right")
        } description: {
            Text("Start a conversation by searching for users or creating a group")
        } actions: {
            Button(action: { showingNewChat = true }) {
                Text("Start Chat")
            }
            .buttonStyle(.borderedProminent)
        }
    }
    
    private var chatListView: some View {
        List {
            // Pinned chats section
            if !viewModel.pinnedChats.isEmpty {
                Section("Pinned") {
                    ForEach(viewModel.pinnedChats) { chat in
                        NavigationLink(value: chat) {
                            ChatRowView(chat: chat, isPinned: true)
                        }
                        .swipeActions(edge: .leading) {
                            Button(action: { viewModel.unpinChat(chat) }) {
                                Label("Unpin", systemImage: "pin.slash")
                            }
                            .tint(.orange)
                        }
                    }
                }
            }
            
            // Regular chats section
            Section(viewModel.pinnedChats.isEmpty ? "" : "All Chats") {
                ForEach(viewModel.chats.filter { !viewModel.pinnedChats.contains($0) }) { chat in
                    NavigationLink(value: chat) {
                        ChatRowView(chat: chat, isPinned: false)
                    }
                    .swipeActions(edge: .leading) {
                        Button(action: { viewModel.pinChat(chat) }) {
                            Label("Pin", systemImage: "pin")
                        }
                        .tint(.orange)
                    }
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive, action: { viewModel.deleteChat(chat) }) {
                            Label("Delete", systemImage: "trash")
                        }
                        
                        Button(action: { viewModel.muteChat(chat) }) {
                            Label(chat.isMuted ? "Unmute" : "Mute", systemImage: chat.isMuted ? "bell" : "bell.slash")
                        }
                        .tint(.gray)
                    }
                }
            }
        }
        .listStyle(.plain)
        .refreshable {
            await viewModel.loadChats()
        }
        .overlay(alignment: .bottomTrailing) {
            // Floating new chat button
            Button(action: { showingNewChat = true }) {
                Image(systemName: "square.and.pencil")
                    .font(.title2)
                    .fontWeight(.semibold)
            }
            .frame(width: 56, height: 56)
            .background(Color.blue)
            .foregroundColor(.white)
            .clipShape(Circle())
            .shadow(radius: 4)
            .padding()
        }
    }
}

// MARK: - Chat Row View
struct ChatRowView: View {
    let chat: Chat
    var isPinned: Bool = false
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            ChatAvatarView(chat: chat)
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    if isPinned {
                        Image(systemName: "pin.fill")
                            .font(.caption2)
                            .foregroundColor(.orange)
                    }
                    
                    Text(chat.displayName)
                        .font(.headline)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    HStack(spacing: 4) {
                        if chat.isMuted {
                            Image(systemName: "bell.slash.fill")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        
                        if let time = chat.lastMessageTime {
                            Text(time, style: .relative)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                HStack {
                    // Message preview with sender name for group chats
                    if chat.type == .group, let senderName = chat.lastMessageSenderName {
                        Text("\(senderName):")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                    
                    if let lastMessage = chat.lastMessage {
                        Text(lastMessage)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    } else {
                        Text("No messages yet")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .italic()
                    }
                    
                    Spacer()
                    
                    if chat.unreadCount > 0 {
                        UnreadBadge(count: chat.unreadCount)
                    }
                }
            }
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
    }
}

// MARK: - Chat Avatar View
struct ChatAvatarView: View {
    let chat: Chat
    
    var body: some View {
        ZStack {
            Circle()
                .fill(avatarColor)
                .frame(width: 50, height: 50)
            
            if let avatarURL = chat.avatarURL, let url = URL(string: avatarURL) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    avatarText
                }
                .frame(width: 50, height: 50)
                .clipShape(Circle())
            } else {
                avatarText
            }
            
            // Online indicator
            if chat.isOnline {
                Circle()
                    .fill(Color.green)
                    .frame(width: 12, height: 12)
                    .overlay(Circle().stroke(Color(.systemBackground), lineWidth: 2))
                    .offset(x: 18, y: 18)
            }
        }
    }
    
    private var avatarColor: Color {
        switch chat.type {
        case .direct: return Color.blue.opacity(0.2)
        case .group: return Color.purple.opacity(0.2)
        }
    }
    
    private var avatarText: some View {
        Text(chat.displayName.prefix(1).uppercased())
            .font(.headline)
            .foregroundColor(chat.type == .direct ? .blue : .purple)
    }
}

// MARK: - Unread Badge
struct UnreadBadge: View {
    let count: Int
    
    var body: some View {
        Group {
            if count > 99 {
                Text("99+")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.blue)
                    .clipShape(Capsule())
            } else if count > 0 {
                Text("\(count)")
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

// MARK: - New Chat Page
struct NewChatPage: View {
    @Environment(\.dismiss) private var dismiss
    let onSelectUser: (User) -> Void
    @State private var searchText = ""
    @StateObject private var searchVM = UserSearchViewModel()
    @StateObject private var recentChatsVM = RecentChatsViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if searchText.isEmpty {
                    recentChatsView
                } else {
                    searchResultsView
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
    
    private var recentChatsView: some View {
        List {
            Section("Recent Chats") {
                if recentChatsVM.isLoading {
                    ProgressView()
                } else if recentChatsVM.recentUsers.isEmpty {
                    Text("No recent chats")
                        .foregroundColor(.secondary)
                } else {
                    ForEach(recentChatsVM.recentUsers) { user in
                        Button(action: { onSelectUser(user) }) {
                            UserRowView(user: user)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
    }
    
    private var searchResultsView: some View {
        Group {
            if searchVM.isSearching {
                ProgressView("Searching...")
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
    }
}

// MARK: - New Group Page
struct NewGroupPage: View {
    @Environment(\.dismiss) private var dismiss
    let onCreateGroup: (String, [String]) -> Void
    
    @State private var groupName = ""
    @State private var searchText = ""
    @StateObject private var searchVM = UserSearchViewModel()
    @State private var selectedMembers: [User] = []
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Group Name") {
                    TextField("Enter group name", text: $groupName)
                }
                
                Section("Add Members") {
                    if selectedMembers.isEmpty {
                        Text("No members selected")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(selectedMembers) { user in
                            HStack {
                                UserRowView(user: user)
                                Spacer()
                                Button(action: { removeMember(user) }) {
                                    Image(systemName: "minus.circle.fill")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                    }
                }
                
                Section("Search Users") {
                    TextField("Search by username or email", text: $searchText)
                        .autocapitalization(.none)
                        .onChange(of: searchText) { _, newValue in
                            Task {
                                await searchVM.search(keyword: newValue)
                            }
                        }
                    
                    if searchVM.isSearching {
                        ProgressView()
                    } else {
                        ForEach(searchVM.users.filter { !selectedMembers.contains($0) }) { user in
                            Button(action: { addMember(user) }) {
                                UserRowView(user: user)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .navigationTitle("New Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        onCreateGroup(groupName, selectedMembers.map { $0.id })
                    }
                    .disabled(groupName.isEmpty || selectedMembers.isEmpty)
                }
            }
        }
    }
    
    private func addMember(_ user: User) {
        if !selectedMembers.contains(user) {
            selectedMembers.append(user)
        }
    }
    
    private func removeMember(_ user: User) {
        selectedMembers.removeAll { $0.id == user.id }
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
            
            // Online status
            if let status = user.status, status == "online" {
                Circle()
                    .fill(Color.green)
                    .frame(width: 8, height: 8)
            }
        }
    }
}

// MARK: - ViewModels
@MainActor
final class ChatListViewModel: ObservableObject {
    @Published var chats: [Chat] = []
    @Published var pinnedChats: [Chat] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let chatUseCase: ChatUseCase
    
    init(chatUseCase: ChatUseCase = ChatUseCase()) {
        self.chatUseCase = chatUseCase
    }
    
    func loadChats() async {
        isLoading = true
        do {
            let allChats = try await chatUseCase.getRecentChats(limit: 50)
            // Separate pinned and regular chats
            pinnedChats = allChats.filter { $0.isPinned }
            chats = allChats.filter { !$0.isPinned }
        } catch {
            // Load mock data on error
            loadMockChats()
        }
        isLoading = false
    }
    
    func startDirectChat(with userID: String) async throws -> Chat {
        return try await chatUseCase.createDirectChat(targetUserID: userID)
    }
    
    func createGroup(name: String, memberIDs: [String]) async throws -> Chat {
        return try await chatUseCase.createGroup(name: name, memberIDs: memberIDs)
    }
    
    func pinChat(_ chat: Chat) {
        // In a real app, this would call an API
        chats.removeAll { $0.id == chat.id }
        var pinnedChat = chat
        pinnedChat.isPinned = true
        pinnedChats.append(pinnedChat)
    }
    
    func unpinChat(_ chat: Chat) {
        pinnedChats.removeAll { $0.id == chat.id }
        var unpinnedChat = chat
        unpinnedChat.isPinned = false
        chats.append(unpinnedChat)
    }
    
    func muteChat(_ chat: Chat) {
        // Toggle mute status
        if let index = chats.firstIndex(where: { $0.id == chat.id }) {
            chats[index].isMuted.toggle()
        }
    }
    
    func deleteChat(_ chat: Chat) {
        chats.removeAll { $0.id == chat.id }
        pinnedChats.removeAll { $0.id == chat.id }
    }
    
    // MARK: - Mock Data
    private func loadMockChats() {
        let user1 = User(id: "user1", username: "user1", email: "user1@test.com", nickname: "Alice")
        let user2 = User(id: "user2", username: "user2", email: "user2@test.com", nickname: "Bob")
        let user3 = User(id: "user3", username: "user3", email: "user3@test.com", nickname: "Charlie")
        let user4 = User(id: "user4", username: "user4", email: "user4@test.com", nickname: "Diana")
        
        pinnedChats = [
            Chat(id: "p1", name: "Alice", type: .direct, lastMessage: "See you later!", lastMessageTime: Date().addingTimeInterval(-300), unreadCount: 2, members: [user1], isPinned: true, isOnline: true),
        ]
        
        chats = [
            Chat(id: "c1", name: "Bob", type: .direct, lastMessage: "How's the project going?", lastMessageTime: Date().addingTimeInterval(-3600), unreadCount: 0, members: [user2], isOnline: true),
            Chat(id: "c2", name: "Charlie", type: .direct, lastMessage: "Thanks for the help!", lastMessageTime: Date().addingTimeInterval(-7200), unreadCount: 0, members: [user3]),
            Chat(id: "c3", name: "Team Chat", type: .group, lastMessageSenderName: "Diana", lastMessage: "Meeting at 3pm", lastMessageTime: Date().addingTimeInterval(-86400), unreadCount: 5, members: [user1, user2, user3, user4]),
            Chat(id: "c4", name: "Diana", type: .direct, lastMessage: "Got the files", lastMessageTime: Date().addingTimeInterval(-172800), unreadCount: 0, members: [user4], isMuted: true),
        ]
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
            // Load mock users on error
            loadMockSearchResults(keyword: keyword)
        }
        isSearching = false
    }
    
    private func loadMockSearchResults(keyword: String) {
        // Mock search results for demo
        if keyword.lowercased().contains("ali") {
            users = [User(id: "u1", username: "alice", email: "alice@test.com", nickname: "Alice", status: "online")]
        } else if keyword.lowercased().contains("bob") {
            users = [User(id: "u2", username: "bob", email: "bob@test.com", nickname: "Bob")]
        } else {
            users = []
        }
    }
}

@MainActor
final class RecentChatsViewModel: ObservableObject {
    @Published var recentUsers: [User] = []
    @Published var isLoading = false
    
    init() {
        // Load mock recent users
        recentUsers = [
            User(id: "user1", username: "alice", email: "alice@test.com", nickname: "Alice", status: "online"),
            User(id: "user2", username: "bob", email: "bob@test.com", nickname: "Bob"),
            User(id: "user3", username: "charlie", email: "charlie@test.com", nickname: "Charlie"),
        ]
    }
}

// MARK: - Extended Chat Model
extension Chat {
    var displayName: String {
        if let name = name {
            return name
        }
        if let firstMember = members?.first(where: { $0.id != Storage.getCurrentUser()?.id }) {
            return firstMember.nickname ?? firstMember.username
        }
        return "Unknown Chat"
    }
    
    var isPinned: Bool {
        // In a real app, this would be a stored property
        false
    }
    
    var isMuted: Bool {
        // In a real app, this would be a stored property
        false
    }
    
    var isOnline: Bool {
        // In a real app, this would come from presence tracking
        false
    }
    
    var lastMessageSenderName: String? {
        // Would be populated from message data
        nil
    }
}

#Preview {
    ChatListPage()
}