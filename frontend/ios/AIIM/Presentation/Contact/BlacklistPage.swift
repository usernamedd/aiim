import SwiftUI

// MARK: - P22: Blacklist Page
struct BlacklistPage: View {
    @StateObject private var viewModel = BlacklistViewModel()
    @State private var showingAddSheet = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.blacklistedUsers.isEmpty {
                    loadingView
                } else if viewModel.blacklistedUsers.isEmpty {
                    emptyStateView
                } else {
                    blacklistListView
                }
            }
            .navigationTitle("Blacklist")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showingAddSheet = true }) {
                        Image(systemName: "plus")
                    }
                }
                ToolbarItem(placement: .topBarLeading) {
                    if !viewModel.blacklistedUsers.isEmpty {
                        EditButton()
                    }
                }
            }
            .sheet(isPresented: $showingAddSheet) {
                AddBlacklistSheet(onAdd: { user in
                    Task { await viewModel.addToBlacklist(user: user) }
                })
            }
            .task {
                await viewModel.loadBlacklist()
            }
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Loading blacklist...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
    
    private var emptyStateView: some View {
        ContentUnavailableView {
            Label("No Blacklisted Users", systemImage: "person.crop.circle.badge.xmark")
        } description: {
            Text("Users you block will appear here")
        } actions: {
            Button(action: { showingAddSheet = true }) {
                Text("Add User")
            }
            .buttonStyle(.borderedProminent)
        }
    }
    
    private var blacklistListView: some View {
        List {
            Section {
                Text("Blocked users cannot send you messages or see your online status")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .listRowBackground(Color.clear)
            }
            
            Section("Blocked Users (\(viewModel.blacklistedUsers.count))") {
                ForEach(viewModel.blacklistedUsers) { item in
                    BlacklistRowView(item: item) {
                        Task { await viewModel.removeFromBlacklist(item) }
                    }
                }
                .onDelete { indexSet in
                    Task {
                        for index in indexSet {
                            await viewModel.removeFromBlacklist(viewModel.blacklistedUsers[index])
                        }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable {
            await viewModel.loadBlacklist()
        }
    }
}

// MARK: - Blacklist Row View
struct BlacklistRowView: View {
    let item: BlacklistedUser
    let onUnblock: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.2))
                    .frame(width: 44, height: 44)
                
                Image(systemName: "slash.circle.fill")
                    .font(.title2)
                    .foregroundColor(.red.opacity(0.7))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.user.nickname ?? item.user.username)
                    .font(.headline)
                Text("@\(item.user.username)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if let reason = item.reason, !reason.isEmpty {
                    Text("Reason: \(reason)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text("Blocked")
                    .font(.caption2)
                    .foregroundColor(.red)
                
                Button(action: onUnblock) {
                    Text("Unblock")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Add Blacklist Sheet
struct AddBlacklistSheet: View {
    @Environment(\.dismiss) private var dismiss
    let onAdd: (User) -> Void
    
    @State private var searchText = ""
    @State private var searchResults: [User] = []
    @State private var isSearching = false
    
    var body: some View {
        NavigationStack {
            List {
                if searchText.isEmpty {
                    Section {
                        Text("Search for a user to block")
                            .foregroundColor(.secondary)
                    }
                } else if isSearching {
                    Section {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                    }
                } else if searchResults.isEmpty {
                    Section {
                        ContentUnavailableView(
                            "No Users Found",
                            systemImage: "person.slash",
                            description: Text("Try a different search term")
                        )
                    }
                } else {
                    Section("Search Results") {
                        ForEach(searchResults) { user in
                            Button(action: { onAdd(user); dismiss() }) {
                                HStack {
                                    UserRowView(user: user)
                                    Spacer()
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.red)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Block User")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Search username")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onChange(of: searchText) { _, newValue in
                performSearch(keyword: newValue)
            }
        }
    }
    
    private func performSearch(keyword: String) {
        guard !keyword.isEmpty else {
            searchResults = []
            return
        }
        
        isSearching = true
        // Mock search results
        try? await Task.sleep(nanoseconds: 300_000_000)
        
        if keyword.lowercased().contains("ali") {
            searchResults = [User(id: "u1", username: "alice", email: "alice@test.com", nickname: "Alice")]
        } else if keyword.lowercased().contains("bob") {
            searchResults = [User(id: "u2", username: "bob", email: "bob@test.com", nickname: "Bob")]
        } else if keyword.lowercased().contains("cha") {
            searchResults = [User(id: "u3", username: "charlie", email: "charlie@test.com", nickname: "Charlie")]
        } else {
            searchResults = []
        }
        isSearching = false
    }
}

// MARK: - ViewModel
@MainActor
final class BlacklistViewModel: ObservableObject {
    @Published var blacklistedUsers: [BlacklistedUser] = []
    @Published var isLoading = false
    @Published var error: String?
    
    func loadBlacklist() async {
        isLoading = true
        error = nil
        
        // Mock data
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        blacklistedUsers = BlacklistedUser.mockBlacklist
        isLoading = false
    }
    
    func addToBlacklist(user: User) async {
        let newItem = BlacklistedUser(
            id: UUID().uuidString,
            user: user,
            blockedAt: Date(),
            reason: nil
        )
        blacklistedUsers.insert(newItem, at: 0)
    }
    
    func removeFromBlacklist(_ item: BlacklistedUser) async {
        blacklistedUsers.removeAll { $0.id == item.id }
    }
}

// MARK: - Mock Data Extension
extension BlacklistedUser {
    static let mockBlacklist: [BlacklistedUser] = [
        BlacklistedUser(
            id: "bl1",
            user: User(id: "b1", username: "spammer", email: "spammer@test.com", nickname: "Spam Bot"),
            blockedAt: Date().addingTimeInterval(-86400),
            reason: " spam messages"
        ),
        BlacklistedUser(
            id: "bl2",
            user: User(id: "b2", username: "toxic_user", email: "toxic@test.com", nickname: "Toxic Person"),
            blockedAt: Date().addingTimeInterval(-172800),
            reason: nil
        ),
        BlacklistedUser(
            id: "bl3",
            user: User(id: "b3", username: "scammer", email: "scam@test.com", nickname: "Scammer Alert"),
            blockedAt: Date().addingTimeInterval(-259200),
            reason: "Attempted fraud"
        )
    ]
}

#Preview {
    BlacklistPage()
}