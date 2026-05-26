import SwiftUI

// MARK: - P22: Group List Page
struct GroupListPage: View {
    @StateObject private var viewModel = GroupListViewModel()
    @State private var showingCreateGroup = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.groups.isEmpty {
                    ProgressView("Loading groups...")
                } else if viewModel.groups.isEmpty {
                    ContentUnavailableView(
                        "No Groups",
                        systemImage: "person.3",
                        description: Text("Create a group to start collaborating")
                    )
                } else {
                    List(viewModel.groups) { group in
                        NavigationLink(destination: GroupDetailPage(groupID: group.id, groupName: group.name ?? "Group")) {
                            GroupRowView(group: group)
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await viewModel.loadGroups()
                    }
                }
            }
            .navigationTitle("Groups")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showingCreateGroup = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingCreateGroup) {
                CreateGroupPage(onCreated: { group in
                    showingCreateGroup = false
                    viewModel.groups.insert(group, at: 0)
                })
            }
            .task {
                await viewModel.loadGroups()
            }
        }
    }
}

// MARK: - Group Row View
struct GroupRowView: View {
    let group: Chat
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color.green.opacity(0.2))
                .frame(width: 50, height: 50)
                .overlay {
                    Image(systemName: "person.3.fill")
                        .foregroundColor(.green)
                }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(group.name ?? "Unnamed Group")
                    .font(.headline)
                
                if let members = group.members {
                    Text("\(members.count) members")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            if group.unreadCount > 0 {
                Text("\(group.unreadCount)")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.green)
                    .clipShape(Capsule())
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Create Group Page
struct CreateGroupPage: View {
    @Environment(\.dismiss) private var dismiss
    let onCreated: (Chat) -> Void
    
    @State private var groupName = ""
    @State private var selectedMembers: [User] = []
    @State private var searchText = ""
    @StateObject private var searchVM = UserSearchViewModel()
    @State private var isCreating = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Group Name") {
                    TextField("Enter group name", text: $groupName)
                }
                
                Section("Add Members") {
                    if !selectedMembers.isEmpty {
                        ForEach(selectedMembers) { user in
                            HStack {
                                UserRowView(user: user)
                                Spacer()
                                Button(action: { selectedMembers.removeAll { $0.id == user.id } }) {
                                    Image(systemName: "minus.circle.fill")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                    }
                    
                    // Search users to add
                    if !searchText.isEmpty && !searchVM.users.isEmpty {
                        ForEach(searchVM.users.filter { user in !selectedMembers.contains { $0.id == user.id } }) { user in
                            Button(action: { selectedMembers.append(user) }) {
                                UserRowView(user: user)
                            }
                        }
                    }
                }
                
                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Create Group")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Search users to add...")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") { createGroup() }
                        .disabled(groupName.isEmpty || selectedMembers.isEmpty || isCreating)
                }
            }
            .onChange(of: searchText) { _, newValue in
                Task { await searchVM.search(keyword: newValue) }
            }
        }
    }
    
    private func createGroup() {
        isCreating = true
        errorMessage = nil
        
        Task {
            do {
                let chatUseCase = ChatUseCase()
                let group = try await chatUseCase.createGroup(
                    name: groupName,
                    memberIDs: selectedMembers.map { $0.id }
                )
                onCreated(group)
            } catch {
                errorMessage = error.localizedDescription
            }
            isCreating = false
        }
    }
}

// MARK: - Group Detail Page
struct GroupDetailPage: View {
    let groupID: String
    let groupName: String
    
    @State private var members: [User] = []
    @State private var isLoading = true
    @State private var showingAddMembers = false
    @State private var showingLeaveConfirm = false
    
    var body: some View {
        List {
            if isLoading {
                ProgressView()
            } else {
                Section("Members (\(members.count))") {
                    ForEach(members) { member in
                        UserRowView(user: member)
                    }
                }
                
                Section {
                    Button(action: { showingAddMembers = true }) {
                        Label("Add Members", systemImage: "person.badge.plus")
                    }
                    
                    Button(role: .destructive, action: { showingLeaveConfirm = true }) {
                        Label("Leave Group", systemImage: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.red)
                    }
                }
            }
        }
        .navigationTitle(groupName)
        .sheet(isPresented: $showingAddMembers) {
            AddMembersPage(groupID: groupID, onAdded: { newMembers in
                members.append(contentsOf: newMembers)
            })
        }
        .alert("Leave Group?", isPresented: $showingLeaveConfirm) {
            Button("Cancel", role: .cancel) { }
            Button("Leave", role: .destructive) {
                Task { await leaveGroup() }
            }
        } message: {
            Text("Are you sure you want to leave this group? This action cannot be undone.")
        }
        .task {
            await loadGroupDetail()
        }
    }
    
    private func loadGroupDetail() async {
        isLoading = true
        do {
            let chatUseCase = ChatUseCase()
            _, members = try await chatUseCase.getChatDetail(chatID: groupID)
        } catch {
            // Handle error
        }
        isLoading = false
    }
    
    private func leaveGroup() async {
        do {
            let chatUseCase = ChatUseCase()
            try await chatUseCase.leaveGroup(chatID: groupID)
        } catch {
            // Handle error
        }
    }
}

// MARK: - Add Members Page
struct AddMembersPage: View {
    let groupID: String
    let onAdded: ([User]) -> Void
    
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @StateObject private var searchVM = UserSearchViewModel()
    @State private var selectedMembers: Set<String> = []
    @State private var isAdding = false
    
    var body: some View {
        NavigationStack {
            Group {
                if searchText.isEmpty {
                    ContentUnavailableView(
                        "Search Users",
                        systemImage: "magnifyingglass",
                        description: Text("Search for users to add to the group")
                    )
                } else if searchVM.isSearching {
                    ProgressView()
                } else {
                    List(searchVM.users) { user in
                        Button(action: { toggleSelection(user) }) {
                            HStack {
                                UserRowView(user: user)
                                Spacer()
                                if selectedMembers.contains(user.id) {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Add Members")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Search users...")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") { addMembers() }
                        .disabled(selectedMembers.isEmpty || isAdding)
                }
            }
            .onChange(of: searchText) { _, newValue in
                Task { await searchVM.search(keyword: newValue) }
            }
        }
    }
    
    private func toggleSelection(_ user: User) {
        if selectedMembers.contains(user.id) {
            selectedMembers.remove(user.id)
        } else {
            selectedMembers.insert(user.id)
        }
    }
    
    private func addMembers() {
        isAdding = true
        Task {
            do {
                let chatUseCase = ChatUseCase()
                try await chatUseCase.addMembers(chatID: groupID, memberIDs: Array(selectedMembers))
                let newUsers = searchVM.users.filter { selectedMembers.contains($0.id) }
                onAdded(newUsers)
                dismiss()
            } catch {
                // Handle error
            }
            isAdding = false
        }
    }
}

// MARK: - ViewModel
@MainActor
final class GroupListViewModel: ObservableObject {
    @Published var groups: [Chat] = []
    @Published var isLoading = false
    
    private let chatUseCase = ChatUseCase()
    
    func loadGroups() async {
        isLoading = true
        do {
            let allChats = try await chatUseCase.getRecentChats(limit: 50)
            // Filter to only group chats
            groups = allChats.filter { $0.type == .group }
        } catch {
            // Handle error
        }
        isLoading = false
    }
}

#Preview {
    GroupListPage()
}