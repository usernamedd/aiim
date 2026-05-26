import SwiftUI

// MARK: - P22: Contact Requests Page (Friend Requests)
struct ContactRequestsPage: View {
    @StateObject private var viewModel = ContactRequestsViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.requests.isEmpty {
                    loadingView
                } else if viewModel.requests.isEmpty {
                    emptyStateView
                } else {
                    requestsListView
                }
            }
            .navigationTitle("Contact Requests")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { Task { await viewModel.loadRequests() } }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .task {
                await viewModel.loadRequests()
            }
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Loading requests...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
    
    private var emptyStateView: some View {
        ContentUnavailableView {
            Label("No Contact Requests", systemImage: "person.badge.plus")
        } description: {
            Text("You don't have any pending contact requests")
        }
    }
    
    private var requestsListView: some View {
        List {
            if !viewModel.pendingRequests.isEmpty {
                Section("Pending") {
                    ForEach(viewModel.pendingRequests) { request in
                        ContactRequestRow(request: request) {
                            Task { await viewModel.acceptRequest(request) }
                        } onReject: {
                            Task { await viewModel.rejectRequest(request) }
                        }
                    }
                }
            }
            
            if !viewModel.processedRequests.isEmpty {
                Section("Processed") {
                    ForEach(viewModel.processedRequests) { request in
                        ContactRequestHistoryRow(request: request)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable {
            await viewModel.loadRequests()
        }
    }
}

// MARK: - Contact Request Row
struct ContactRequestRow: View {
    let request: ContactRequest
    let onAccept: () -> Void
    let onReject: () -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                // Avatar
                Circle()
                    .fill(Color.blue.opacity(0.2))
                    .frame(width: 50, height: 50)
                    .overlay {
                        Text(String(request.fromUser.nickname?.prefix(1) ?? request.fromUser.username.prefix(1)).uppercased())
                            .font(.headline)
                            .foregroundColor(.blue)
                    }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(request.fromUser.nickname ?? request.fromUser.username)
                        .font(.headline)
                    Text("@\(request.fromUser.username)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if let message = request.message, !message.isEmpty {
                        Text("\"\(message)\"")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                            .padding(.top, 2)
                    }
                }
                
                Spacer()
                
                Text(request.createdAt, style: .relative)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            HStack(spacing: 12) {
                Button(action: onAccept) {
                    Text("Accept")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
                
                Button(action: onReject) {
                    Text("Decline")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(8)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Contact Request History Row
struct ContactRequestHistoryRow: View {
    let request: ContactRequest
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color.gray.opacity(0.2))
                .frame(width: 40, height: 40)
                .overlay {
                    Text(String(request.fromUser.nickname?.prefix(1) ?? request.fromUser.username.prefix(1)).uppercased())
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(request.fromUser.nickname ?? request.fromUser.username)
                    .font(.subheadline)
                Text("@\(request.fromUser.username)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(request.status == .accepted ? "Accepted" : "Rejected")
                .font(.caption)
                .foregroundColor(request.status == .accepted ? .green : .red)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    (request.status == .accepted ? Color.green : Color.red).opacity(0.1)
                )
                .cornerRadius(4)
        }
    }
}

// MARK: - ViewModel
@MainActor
final class ContactRequestsViewModel: ObservableObject {
    @Published var requests: [ContactRequest] = []
    @Published var isLoading = false
    @Published var error: String?
    
    var pendingRequests: [ContactRequest] {
        requests.filter { $0.status == .pending }
    }
    
    var processedRequests: [ContactRequest] {
        requests.filter { $0.status != .pending }
    }
    
    func loadRequests() async {
        isLoading = true
        error = nil
        
        // Mock data
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        requests = ContactRequest.mockRequests
        isLoading = false
    }
    
    func acceptRequest(_ request: ContactRequest) async {
        if let index = requests.firstIndex(where: { $0.id == request.id }) {
            requests[index] = ContactRequest(
                id: request.id,
                fromUser: request.fromUser,
                toUser: request.toUser,
                status: .accepted,
                createdAt: request.createdAt,
                message: request.message
            )
        }
    }
    
    func rejectRequest(_ request: ContactRequest) async {
        if let index = requests.firstIndex(where: { $0.id == request.id }) {
            requests[index] = ContactRequest(
                id: request.id,
                fromUser: request.fromUser,
                toUser: request.toUser,
                status: .rejected,
                createdAt: request.createdAt,
                message: request.message
            )
        }
    }
}

// MARK: - Mock Data Extension
extension ContactRequest {
    static let mockRequests: [ContactRequest] = [
        ContactRequest(
            id: "req1",
            fromUser: User(id: "u1", username: "alice", email: "alice@test.com", nickname: "Alice Chen"),
            toUser: User(id: "current", username: "me", email: "me@test.com"),
            status: .pending,
            createdAt: Date().addingTimeInterval(-3600),
            message: "Hi! I'd like to connect with you."
        ),
        ContactRequest(
            id: "req2",
            fromUser: User(id: "u2", username: "bob", email: "bob@test.com", nickname: "Bob Smith"),
            toUser: User(id: "current", username: "me", email: "me@test.com"),
            status: .pending,
            createdAt: Date().addingTimeInterval(-7200),
            message: nil
        ),
        ContactRequest(
            id: "req3",
            fromUser: User(id: "u3", username: "charlie", email: "charlie@test.com", nickname: "Charlie"),
            toUser: User(id: "current", username: "me", email: "me@test.com"),
            status: .accepted,
            createdAt: Date().addingTimeInterval(-86400),
            message: nil
        ),
        ContactRequest(
            id: "req4",
            fromUser: User(id: "u4", username: "diana", email: "diana@test.com", nickname: "Diana"),
            toUser: User(id: "current", username: "me", email: "me@test.com"),
            status: .rejected,
            createdAt: Date().addingTimeInterval(-172800),
            message: "Let's connect!"
        )
    ]
}

#Preview {
    ContactRequestsPage()
}