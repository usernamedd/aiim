import SwiftUI

// MARK: - P03: Chat Detail Page (Messages)
struct ChatDetailPage: View {
    let chatID: String
    let chatName: String
    
    @StateObject private var viewModel: ChatDetailViewModel
    @State private var messageText = ""
    @State private var isLoadingMore = false
    @State private var hasMore = true
    @FocusState private var isInputFocused: Bool
    
    init(chatID: String, chatName: String) {
        self.chatID = chatID
        self.chatName = chatName
        self._viewModel = StateObject(wrappedValue: ChatDetailViewModel(chatID: chatID))
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Messages List
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        // Load more indicator
                        if hasMore && !viewModel.messages.isEmpty {
                            ProgressView()
                                .padding(.vertical, 8)
                                .onAppear {
                                    Task { await loadMore() }
                                }
                        }
                        
                        // Messages
                        ForEach(viewModel.messages) { message in
                            MessageBubbleView(
                                message: message,
                                isOwn: message.senderID == viewModel.currentUserID
                            )
                            .id(message.id)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                }
                .refreshable {
                    await viewModel.loadMessages()
                    hasMore = viewModel.hasMore
                }
                .onChange(of: viewModel.messages.count) { _, _ in
                    scrollToBottom(proxy: proxy)
                }
            }
            
            Divider()
            
            // Typing Indicator
            if viewModel.isTyping {
                HStack {
                    TypingIndicatorView()
                    Text("\(viewModel.typingUserName) is typing...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 4)
            }
            
            // Message Input
            MessageInputView(
                text: $messageText,
                isFocused: $isInputFocused,
                onSend: sendMessage
            )
        }
        .navigationTitle(chatName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                NavigationLink(destination: ChatInfoPage(chatID: chatID)) {
                    Image(systemName: "info.circle")
                }
            }
        }
        .task {
            await viewModel.loadMessages()
            hasMore = viewModel.hasMore
        }
    }
    
    private func scrollToBottom(proxy: ScrollViewProxy) {
        if let lastMessage = viewModel.messages.last {
            withAnimation(.easeOut(duration: 0.2)) {
                proxy.scrollTo(lastMessage.id, anchor: .bottom)
            }
        }
    }
    
    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let content = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        messageText = ""
        
        Task {
            if let message = try? await viewModel.sendMessage(content: content, type: .text) {
                // Message already added via WebSocket or local update
            }
        }
    }
    
    private func loadMore() async {
        guard !isLoadingMore, hasMore else { return }
        
        isLoadingMore = true
        await viewModel.loadMoreMessages()
        hasMore = viewModel.hasMore
        isLoadingMore = false
    }
}

// MARK: - Message Bubble View
struct MessageBubbleView: View {
    let message: Message
    let isOwn: Bool
    
    var body: some View {
        HStack {
            if isOwn { Spacer(minLength: 60) }
            
            VStack(alignment: isOwn ? .trailing : .leading, spacing: 2) {
                // Sender name for others
                if !isOwn {
                    Text(message.senderName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Content
                messageContent
                
                // Timestamp and status
                HStack(spacing: 4) {
                    Text(message.createdAt, style: .time)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    if isOwn {
                        Image(systemName: message.statusIcon)
                            .font(.caption2)
                            .foregroundColor(message.statusColor)
                    }
                }
            }
            
            if !isOwn { Spacer(minLength: 60) }
        }
    }
    
    @ViewBuilder
    private var messageContent: some View {
        switch message.type {
        case .text:
            if let content = message.content {
                Text(content)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(isOwn ? Color.blue : Color(.systemGray5))
                    .foregroundColor(isOwn ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        case .image:
            if let mediaURL = message.mediaURL {
                AsyncImage(url: URL(string: mediaURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                } placeholder: {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemGray5))
                        .overlay(ProgressView())
                }
                .frame(maxWidth: 200, maxHeight: 200)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        case .file:
            fileAttachment
        case .audio:
            audioMessage
        }
    }
    
    private var fileAttachment: some View {
        HStack(spacing: 8) {
            Image(systemName: "doc.fill")
                .foregroundColor(.blue)
            if let content = message.content {
                Text(content)
                    .font(.subheadline)
                    .lineLimit(1)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.systemGray5))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    private var audioMessage: some View {
        HStack(spacing: 8) {
            Image(systemName: "waveform")
                .foregroundColor(.blue)
            if let content = message.content {
                Text(content)
                    .font(.subheadline)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.systemGray5))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Message Status Extension
extension Message {
    var statusIcon: String {
        switch status {
        case .sent: return "checkmark"
        case .delivered: return "checkmark.circle"
        case .read: return "checkmark.circle.fill"
        case .failed: return "exclamationmark.circle"
        }
    }
    
    var statusColor: Color {
        switch status {
        case .sent: return .secondary
        case .delivered: return .secondary
        case .read: return .blue
        case .failed: return .red
        }
    }
}

// MARK: - Message Status Enum
enum MessageStatus: String, Codable {
    case sent
    case delivered
    case read
    case failed
}

// MARK: - Message Input View
struct MessageInputView: View {
    @Binding var text: String
    var isFocused: FocusState<Bool>.Binding
    let onSend: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Attachment button
            Button(action: {}) {
                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundColor(.blue)
            }
            
            // Text field
            TextField("Message...", text: $text, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .lineLimit(1...5)
                .focused(isFocused)
            
            // Send button
            Button(action: onSend) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title)
                    .foregroundColor(canSend ? .blue : .gray)
            }
            .disabled(!canSend)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color(.systemBackground))
    }
    
    private var canSend: Bool {
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
}

// MARK: - Typing Indicator View
struct TypingIndicatorView: View {
    @State private var animatingIndex = 0
    
    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(Color.secondary)
                    .frame(width: 6, height: 6)
                    .opacity(index == animatingIndex ? 1 : 0.3)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 0.6).repeatForever()) {
                animatingIndex = (animatingIndex + 1) % 3
            }
        }
    }
}

// MARK: - Chat Info Page
struct ChatInfoPage: View {
    let chatID: String
    @State private var members: [User] = []
    @State private var isLoading = true
    @State private var chatInfo: Chat?
    
    var body: some View {
        List {
            // Chat Header
            Section {
                HStack(spacing: 16) {
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 60, height: 60)
                        .overlay {
                            Text(String((chatInfo?.name ?? "C").prefix(1)).uppercased())
                                .font(.title2)
                                .foregroundColor(.blue)
                        }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(chatInfo?.name ?? "Chat")
                            .font(.headline)
                        Text("\(members.count) members")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }
            
            // Members
            Section("Members") {
                if isLoading {
                    ProgressView()
                } else {
                    ForEach(members) { member in
                        UserRowView(user: member)
                    }
                }
            }
            
            // Actions
            Section {
                Button(action: {}) {
                    Label("Search Messages", systemImage: "magnifyingglass")
                }
                
                Button(role: .destructive, action: {}) {
                    Label("Delete Chat", systemImage: "trash")
                }
            }
        }
        .navigationTitle("Chat Info")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do {
                let chatUseCase = ChatUseCase()
                let result = try await chatUseCase.getChatDetail(chatID: chatID)
                chatInfo = result.chat
                members = result.members
            } catch {
                // Handle error
            }
            isLoading = false
        }
    }
}

// MARK: - Chat Detail ViewModel
@MainActor
final class ChatDetailViewModel: ObservableObject {
    let chatID: String
    let currentUserID: String
    
    @Published var messages: [Message] = []
    @Published var hasMore = true
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isTyping = false
    @Published var typingUserName: String = ""
    
    private let chatUseCase: ChatUseCase
    
    init(chatID: String, chatUseCase: ChatUseCase = ChatUseCase()) {
        self.chatID = chatID
        self.chatUseCase = chatUseCase
        self.currentUserID = Storage.getCurrentUser()?.id ?? ""
        
        // Load mock messages for demo
        loadMockMessages()
    }
    
    func loadMessages() async {
        isLoading = true
        do {
            messages = try await chatUseCase.getMessages(chatID: chatID, limit: 30)
            hasMore = messages.count == 30
        } catch {
            // Use mock data on error
            loadMockMessages()
        }
        isLoading = false
    }
    
    func loadMoreMessages() async {
        guard let beforeID = messages.first?.id else { return }
        do {
            let olderMessages = try await chatUseCase.getMessages(chatID: chatID, limit: 30, before: beforeID)
            messages.insert(contentsOf: olderMessages, at: 0)
            hasMore = olderMessages.count == 30
        } catch {
            // Silent fail for load more
        }
    }
    
    func sendMessage(content: String?, mediaURL: String? = nil, type: MessageType) async throws -> Message {
        let message = Message(
            id: UUID().uuidString,
            chatID: chatID,
            senderID: currentUserID,
            senderName: Storage.getCurrentUser()?.nickname ?? "You",
            content: content,
            mediaURL: mediaURL,
            type: type,
            createdAt: Date()
        )
        
        // Add to local messages immediately
        messages.append(message)
        
        // In production, this would go through WebSocket
        return message
    }
    
    // MARK: - Mock Data for Demo
    private func loadMockMessages() {
        let now = Date()
        let user1 = User(id: "user1", username: "user1", email: "user1@test.com", nickname: "User One")
        let user2 = User(id: "user2", username: "user2", email: "user2@test.com", nickname: "User Two")
        
        messages = [
            Message(id: "1", chatID: chatID, senderID: "user1", senderName: "User One", content: "Hey! How's it going?", type: .text, createdAt: now.addingTimeInterval(-3600)),
            Message(id: "2", chatID: chatID, senderID: "user2", senderName: "User Two", content: "Pretty good! Just working on the new feature.", type: .text, createdAt: now.addingTimeInterval(-3000)),
            Message(id: "3", chatID: chatID, senderID: "user1", senderName: "User One", content: "Nice! Can't wait to see it.", type: .text, createdAt: now.addingTimeInterval(-2400)),
            Message(id: "4", chatID: chatID, senderID: "user2", senderName: "User Two", content: "Here, check this out 👀", type: .text, createdAt: now.addingTimeInterval(-1800)),
            Message(id: "5", chatID: chatID, senderID: "user1", senderName: "User One", content: "Looks great!", type: .text, createdAt: now.addingTimeInterval(-600)),
            Message(id: "6", chatID: chatID, senderID: "user2", senderName: "User Two", content: "Thanks! Let me know if you have any questions.", type: .text, createdAt: now.addingTimeInterval(-300)),
        ]
        
        hasMore = false
    }
}

// MARK: - Extended Message Model with Status
extension Message {
    // Status is managed separately in a real app via WebSocket
    var status: MessageStatus {
        if senderID == Storage.getCurrentUser()?.id {
            return .read // Own messages are marked as read
        }
        return .delivered
    }
}

#Preview {
    NavigationStack {
        ChatDetailPage(chatID: "test", chatName: "Test Chat")
    }
}