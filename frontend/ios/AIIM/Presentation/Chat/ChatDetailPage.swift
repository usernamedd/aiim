import SwiftUI

// MARK: - P03: Chat Detail Page (Messages)
struct ChatDetailPage: View {
    let chatID: String
    let chatName: String
    
    @StateObject private var viewModel: ChatDetailViewModel
    @State private var messageText = ""
    @State private var messages: [Message] = []
    @State private var isLoadingMore = false
    @State private var hasMore = true
    
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
                        if hasMore && !messages.isEmpty {
                            ProgressView()
                                .padding()
                                .onAppear {
                                    Task { await loadMore() }
                                }
                        }
                        
                        ForEach(messages) { message in
                            MessageBubbleView(message: message, isOwn: message.senderID == viewModel.currentUserID)
                                .id(message.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: messages.count) { _, _ in
                    if let lastMessage = messages.last {
                        withAnimation {
                            proxy.scrollTo(lastMessage.id, anchor: .bottom)
                        }
                    }
                }
            }
            
            Divider()
            
            // Message Input
            HStack(spacing: 12) {
                TextField("Message...", text: $messageText)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title)
                        .foregroundColor(.blue)
                }
                .disabled(messageText.isEmpty)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color(.systemBackground))
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
            messages = viewModel.messages
            hasMore = viewModel.hasMore
        }
    }
    
    private func sendMessage() {
        guard !messageText.isEmpty else { return }
        
        let content = messageText
        messageText = ""
        
        Task {
            if let message = try? await viewModel.sendMessage(content: content, type: .text) {
                messages.append(message)
            }
        }
    }
    
    private func loadMore() async {
        guard !isLoadingMore, hasMore else { return }
        
        isLoadingMore = true
        await viewModel.loadMoreMessages()
        messages = viewModel.messages
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
                if !isOwn {
                    Text(message.senderName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Content
                Group {
                    if let content = message.content {
                        Text(content)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(isOwn ? Color.blue : Color.gray.opacity(0.2))
                            .foregroundColor(isOwn ? .white : .primary)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    } else if let mediaURL = message.mediaURL {
                        // Placeholder for media
                        AsyncImage(url: URL(string: mediaURL)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        } placeholder: {
                            ProgressView()
                        }
                        .frame(maxWidth: 200, maxHeight: 200)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                
                Text(message.createdAt, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            if !isOwn { Spacer(minLength: 60) }
        }
    }
}

// MARK: - Chat Info Page
struct ChatInfoPage: View {
    let chatID: String
    @State private var members: [User] = []
    @State private var isLoading = true
    
    var body: some View {
        List {
            if isLoading {
                ProgressView()
            } else {
                Section("Members") {
                    ForEach(members) { member in
                        UserRowView(user: member)
                    }
                }
            }
        }
        .navigationTitle("Chat Info")
        .task {
            do {
                let chatUseCase = ChatUseCase()
                _, members = try await chatUseCase.getChatDetail(chatID: chatID)
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
    
    private let chatUseCase: ChatUseCase
    
    init(chatID: String, chatUseCase: ChatUseCase = ChatUseCase()) {
        self.chatID = chatID
        self.chatUseCase = chatUseCase
        self.currentUserID = Storage.getCurrentUser()?.id ?? ""
    }
    
    func loadMessages() async {
        isLoading = true
        do {
            messages = try await chatUseCase.getMessages(chatID: chatID, limit: 30)
            hasMore = messages.count == 30
        } catch {
            errorMessage = error.localizedDescription
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
    
    func sendMessage(content: String?, mediaURL: String?, type: MessageType) async throws -> Message {
        // For now, create local message - WebSocket would handle real sync
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
        // In production, this would go through WebSocket
        return message
    }
}

#Preview {
    NavigationStack {
        ChatDetailPage(chatID: "test", chatName: "Test Chat")
    }
}