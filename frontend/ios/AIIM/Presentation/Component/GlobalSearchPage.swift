import SwiftUI

// MARK: - P60: Global Search Page
struct GlobalSearchPage: View {
    @State private var searchText = ""
    @State private var recentSearches: [String] = []
    @State private var showSearchResult = false
    @StateObject private var viewModel = GlobalSearchViewModel()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    TextField("Search everything...", text: $searchText)
                        .textFieldStyle(.plain)
                        .submitLabel(.search)
                        .onSubmit {
                            performSearch()
                        }
                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding()
                
                // Content
                if searchText.isEmpty {
                    searchHomeContent
                } else {
                    searchSuggestionsContent
                }
            }
            .navigationTitle("Search")
            .navigationDestination(isPresented: $showSearchResult) {
                SearchResultPage(query: searchText, viewModel: viewModel)
            }
            .onAppear {
                loadRecentSearches()
            }
        }
    }
    
    // MARK: - Search Home Content (History + Hot)
    private var searchHomeContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Recent Searches
                if !recentSearches.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Recent Searches")
                                .font(.headline)
                            Spacer()
                            Button("Clear") {
                                clearRecentSearches()
                            }
                            .font(.subheadline)
                            .foregroundColor(.blue)
                        }
                        
                        ForEach(recentSearches, id: \.self) { keyword in
                            Button(action: {
                                searchText = keyword
                                performSearch()
                            }) {
                                HStack {
                                    Image(systemName: "clock.arrow.circlepath")
                                        .foregroundColor(.secondary)
                                    Text(keyword)
                                        .foregroundColor(.primary)
                                    Spacer()
                                    Image(systemName: "arrow.up.left")
                                        .foregroundColor(.secondary)
                                        .font(.caption)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                
                // Hot Searches
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                        Text("Hot Searches")
                            .font(.headline)
                    }
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 12) {
                        ForEach(viewModel.hotSearches, id: \.self) { item in
                            Button(action: {
                                searchText = item.keyword
                                performSearch()
                            }) {
                                HStack {
                                    Text(item.keyword)
                                        .font(.subheadline)
                                        .foregroundColor(.primary)
                                        .lineLimit(1)
                                    Spacer()
                                    Text("\(item.count)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                
                // Quick Categories
                VStack(alignment: .leading, spacing: 12) {
                    Text("Browse Categories")
                        .font(.headline)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        ForEach(SearchCategory.allCases, id: \.self) { category in
                            NavigationLink(destination: categoryDestination(category)) {
                                VStack(spacing: 8) {
                                    Image(systemName: category.icon)
                                        .font(.title2)
                                        .foregroundColor(category.color)
                                    Text(category.rawValue)
                                        .font(.caption)
                                        .foregroundColor(.primary)
                                        .lineLimit(1)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding()
        }
    }
    
    // MARK: - Search Suggestions
    private var searchSuggestionsContent: some View {
        List {
            // Quick suggestion categories
            ForEach(SearchCategory.allCases, id: \.self) { category in
                Section {
                    ForEach(viewModel.getSuggestions(for: searchText, in: category)) { suggestion in
                        Button(action: {
                            searchText = suggestion.title
                            performSearch()
                        }) {
                            HStack {
                                Image(systemName: suggestion.icon)
                                    .foregroundColor(.secondary)
                                Text(suggestion.title)
                                    .foregroundColor(.primary)
                                Spacer()
                                Text(suggestion.subtitle)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                } header: {
                    Text(category.rawValue)
                }
            }
        }
        .listStyle(.plain)
    }
    
    // MARK: - Helpers
    private func performSearch() {
        guard !searchText.isEmpty else { return }
        saveToRecent(searchText)
        showSearchResult = true
    }
    
    private func loadRecentSearches() {
        // Mock recent searches
        recentSearches = ["AI assistant", "Machine learning", "Chatbot tutorial"]
    }
    
    private func saveToRecent(_ keyword: String) {
        if !recentSearches.contains(keyword) {
            recentSearches.insert(keyword, at: 0)
            if recentSearches.count > 10 {
                recentSearches.removeLast()
            }
        }
    }
    
    private func clearRecentSearches() {
        recentSearches.removeAll()
    }
    
    @ViewBuilder
    private func categoryDestination(_ category: SearchCategory) -> some View {
        switch category {
        case .users:
            SearchResultPage(query: "", viewModel: viewModel, initialCategory: .users)
        case .chats:
            SearchResultPage(query: "", viewModel: viewModel, initialCategory: .chats)
        case .groups:
            SearchResultPage(query: "", viewModel: viewModel, initialCategory: .groups)
        case .messages:
            SearchResultPage(query: "", viewModel: viewModel, initialCategory: .messages)
        case .files:
            SearchResultPage(query: "", viewModel: viewModel, initialCategory: .files)
        case .settings:
            SearchResultPage(query: "", viewModel: viewModel, initialCategory: .settings)
        }
    }
}

// MARK: - Search Category
enum SearchCategory: String, CaseIterable {
    case users = "Users"
    case chats = "Chats"
    case groups = "Groups"
    case messages = "Messages"
    case files = "Files"
    case settings = "Settings"
    
    var icon: String {
        switch self {
        case .users: return "person.fill"
        case .chats: return "bubble.left.and.bubble.right.fill"
        case .groups: return "person.3.fill"
        case .messages: return "envelope.fill"
        case .files: return "folder.fill"
        case .settings: return "gear"
        }
    }
    
    var color: Color {
        switch self {
        case .users: return .blue
        case .chats: return .green
        case .groups: return .purple
        case .messages: return .orange
        case .files: return .yellow
        case .settings: return .gray
        }
    }
}

// MARK: - Search Suggestion
struct SearchSuggestion: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
}

// MARK: - Hot Search Item
struct HotSearchItem {
    let keyword: String
    let count: Int
}

// MARK: - Global Search ViewModel
@MainActor
final class GlobalSearchViewModel: ObservableObject {
    @Published var hotSearches: [HotSearchItem] = []
    @Published var suggestions: [SearchCategory: [SearchSuggestion]] = [:]
    
    init() {
        loadMockData()
    }
    
    func loadMockData() {
        // Mock hot searches
        hotSearches = [
            HotSearchItem(keyword: "AI Assistant", count: 15600),
            HotSearchItem(keyword: "Machine Learning", count: 12300),
            HotSearchItem(keyword: "Chatbot", count: 8900),
            HotSearchItem(keyword: "Natural Language", count: 6700),
            HotSearchItem(keyword: "Neural Networks", count: 5400),
            HotSearchItem(keyword: "Deep Learning", count: 4100),
            HotSearchItem(keyword: "Computer Vision", count: 3200),
            HotSearchItem(keyword: "Reinforcement Learning", count: 2800)
        ]
        
        // Mock suggestions
        suggestions = [
            .users: [
                SearchSuggestion(title: "Alice Johnson", subtitle: "User", icon: "person.fill"),
                SearchSuggestion(title: "Alex Chen", subtitle: "User", icon: "person.fill"),
                SearchSuggestion(title: "Aria Smith", subtitle: "User", icon: "person.fill")
            ],
            .chats: [
                SearchSuggestion(title: "AI Development Team", subtitle: "Chat", icon: "bubble.left.and.bubble.right.fill"),
                SearchSuggestion(title: "ML Projects", subtitle: "Chat", icon: "bubble.left.and.bubble.right.fill")
            ],
            .groups: [
                SearchSuggestion(title: "iOS Developers", subtitle: "Group", icon: "person.3.fill"),
                SearchSuggestion(title: "Swift Enthusiasts", subtitle: "Group", icon: "person.3.fill")
            ],
            .messages: [
                SearchSuggestion(title: "How to train model", subtitle: "In: General", icon: "envelope.fill"),
                SearchSuggestion(title: "API documentation", subtitle: "In: Dev", icon: "envelope.fill")
            ],
            .files: [
                SearchSuggestion(title: "project_spec.pdf", subtitle: "Document", icon: "folder.fill"),
                SearchSuggestion(title: "architecture.png", subtitle: "Image", icon: "folder.fill")
            ],
            .settings: [
                SearchSuggestion(title: "Account Settings", subtitle: "Settings", icon: "gear"),
                SearchSuggestion(title: "Privacy Settings", subtitle: "Settings", icon: "gear")
            ]
        ]
    }
    
    func getSuggestions(for query: String, in category: SearchCategory) -> [SearchSuggestion] {
        guard !query.isEmpty else { return [] }
        let lowercasedQuery = query.lowercased()
        return suggestions[category]?.filter {
            $0.title.lowercased().contains(lowercasedQuery)
        } ?? []
    }
}

// MARK: - Preview
#Preview {
    GlobalSearchPage()
}