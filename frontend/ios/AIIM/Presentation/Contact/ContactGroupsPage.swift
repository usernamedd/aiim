import SwiftUI

// MARK: - P22: Contact Groups Page
struct ContactGroupsPage: View {
    @StateObject private var viewModel = ContactGroupsViewModel()
    @State private var showingCreateSheet = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.groups.isEmpty {
                    loadingView
                } else if viewModel.groups.isEmpty {
                    emptyStateView
                } else {
                    groupsListView
                }
            }
            .navigationTitle("Contact Groups")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showingCreateSheet = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingCreateSheet) {
                CreateGroupSheet(onCreate: { name in
                    Task { await viewModel.createGroup(name: name) }
                })
            }
            .task {
                await viewModel.loadGroups()
            }
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Loading groups...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
    
    private var emptyStateView: some View {
        ContentUnavailableView {
            Label("No Contact Groups", systemImage: "person.3")
        } description: {
            Text("Create groups to organize your contacts")
        } actions: {
            Button(action: { showingCreateSheet = true }) {
                Text("Create Group")
            }
            .buttonStyle(.borderedProminent)
        }
    }
    
    private var groupsListView: some View {
        List {
            ForEach(viewModel.groups) { group in
                NavigationLink(destination: ContactGroupDetailPage(group: group)) {
                    ContactGroupRow(group: group)
                }
            }
            .onDelete { indexSet in
                Task {
                    for index in indexSet {
                        await viewModel.deleteGroup(viewModel.groups[index])
                    }
                }
            }
        }
        .listStyle(.plain)
        .refreshable {
            await viewModel.loadGroups()
        }
    }
}

// MARK: - Contact Group Row
struct ContactGroupRow: View {
    let group: ContactGroup
    
    var body: some View {
        HStack(spacing: 12) {
            // Group Avatar
            ZStack {
                Circle()
                    .fill(Color.purple.opacity(0.2))
                    .frame(width: 50, height: 50)
                
                Image(systemName: "person.3.fill")
                    .font(.title2)
                    .foregroundColor(.purple)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(group.name)
                    .font(.headline)
                Text("\(group.memberCount) members")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Contact Group Detail Page
struct ContactGroupDetailPage: View {
    let group: ContactGroup
    @StateObject private var viewModel: GroupDetailViewModel
    
    init(group: ContactGroup) {
        self.group = group
        _viewModel = StateObject(wrappedValue: GroupDetailViewModel(group: group))
    }
    
    var body: some View {
        List {
            Section {
                HStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(Color.purple.opacity(0.2))
                            .frame(width: 60, height: 60)
                        
                        Image(systemName: "person.3.fill")
                            .font(.title)
                            .foregroundColor(.purple)
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(group.name)
                            .font(.headline)
                        Text("\(group.memberCount) members")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Text("Created \(group.createdAt, style: .date)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }
            
            Section("Members") {
                if let members = group.members {
                    ForEach(members) { user in
                        UserRowView(user: user)
                    }
                } else {
                    ForEach(viewModel.members) { user in
                        UserRowView(user: user)
                    }
                }
            }
            
            Section {
                Button(action: {}) {
                    Label("Add Members", systemImage: "person.badge.plus")
                }
                
                Button(role: .destructive, action: {}) {
                    Label("Delete Group", systemImage: "trash")
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Group Details")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Group Detail ViewModel
@MainActor
final class GroupDetailViewModel: ObservableObject {
    @Published var members: [User] = []
    
    init(group: ContactGroup) {
        self.members = group.members ?? User.mockUsers
    }
}

// MARK: - Create Group Sheet
struct CreateGroupSheet: View {
    @Environment(\.dismiss) private var dismiss
    let onCreate: (String) -> Void
    
    @State private var groupName = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Group Name") {
                    TextField("Enter group name", text: $groupName)
                }
                
                Section {
                    Text("You can add members after creating the group")
                        .font(.caption)
                        .foregroundColor(.secondary)
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
                        onCreate(groupName)
                        dismiss()
                    }
                    .disabled(groupName.isEmpty)
                }
            }
        }
    }
}

// MARK: - ViewModel
@MainActor
final class ContactGroupsViewModel: ObservableObject {
    @Published var groups: [ContactGroup] = []
    @Published var isLoading = false
    @Published var error: String?
    
    func loadGroups() async {
        isLoading = true
        error = nil
        
        // Mock data
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        groups = ContactGroup.mockGroups
        isLoading = false
    }
    
    func createGroup(name: String) async {
        let newGroup = ContactGroup(
            id: UUID().uuidString,
            name: name,
            avatarURL: nil,
            memberCount: 0,
            members: nil,
            createdAt: Date()
        )
        groups.insert(newGroup, at: 0)
    }
    
    func deleteGroup(_ group: ContactGroup) async {
        groups.removeAll { $0.id == group.id }
    }
}

// MARK: - Mock Data Extensions
extension ContactGroup {
    static let mockGroups: [ContactGroup] = [
        ContactGroup(
            id: "g1",
            name: "Family",
            avatarURL: nil,
            memberCount: 8,
            members: nil,
            createdAt: Date().addingTimeInterval(-2592000)
        ),
        ContactGroup(
            id: "g2",
            name: "Work Colleagues",
            avatarURL: nil,
            memberCount: 15,
            members: User.mockUsers,
            createdAt: Date().addingTimeInterval(-1296000)
        ),
        ContactGroup(
            id: "g3",
            name: "Close Friends",
            avatarURL: nil,
            memberCount: 5,
            members: nil,
            createdAt: Date().addingTimeInterval(-604800)
        ),
        ContactGroup(
            id: "g4",
            name: "Gaming Buddies",
            avatarURL: nil,
            memberCount: 12,
            members: nil,
            createdAt: Date().addingTimeInterval(-86400)
        )
    ]
}

extension User {
    static let mockUsers: [User] = [
        User(id: "u1", username: "alice", email: "alice@test.com", nickname: "Alice"),
        User(id: "u2", username: "bob", email: "bob@test.com", nickname: "Bob"),
        User(id: "u3", username: "charlie", email: "charlie@test.com", nickname: "Charlie"),
        User(id: "u4", username: "diana", email: "diana@test.com", nickname: "Diana"),
        User(id: "u5", username: "evan", email: "evan@test.com", nickname: "Evan")
    ]
}

#Preview {
    ContactGroupsPage()
}