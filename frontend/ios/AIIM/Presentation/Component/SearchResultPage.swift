import SwiftUI

// MARK: - P61: Search Result Page
struct SearchResultPage: View {
    let query: String
    @ObservedObject var viewModel: GlobalSearchViewModel
    var initialCategory: SearchCategory? = nil
    
    @State private var selectedCategory: SearchCategory = .users
    @State private var isLoading = false
    @State private var searchResults: [SearchCategory: [SearchResultItem]] = [:]
    
    var body: some View {
        VStack(spacing: 0) {
            // Category Tabs
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(SearchCategory.allCases, id: \.self) { category in
                        Button(action: {
                            selectedCategory = category
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: category.icon)
                                    .font(.caption)
                                Text(category.rawValue)
                                    .font(.subheadline)
                                Text("(\(getResultCount(for: category)))")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(selectedCategory == category ? category.color.opacity(0.2) : Color(.systemGray6))
                            .foregroundColor(selectedCategory == category ? category.color : .primary)
                            .cornerRadius(20)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }
            
            Divider()
            
            // Results
            if isLoading {
                Spacer()
                ProgressView("Searching...")
                Spacer()
            } else if let results = searchResults[selectedCategory], !results.isEmpty {
                List(results) { item in
                    SearchResultRow(item: item)
                }
                .listStyle(.plain)
            } else {
                Spacer()
                ContentUnavailableView(
                    "No Results",
                    systemImage: "magnifyingglass",
                    description: Text(query.isEmpty ? "Select a category to browse" : "No results found for \"\(query)\"")
                )
                Spacer()
            }
        }
        .navigationTitle(query.isEmpty ? "Browse" : "Results for \"\(query)\"")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if let initial = initialCategory {
                selectedCategory = initial
            }
            loadResults()
        }
        .onChange(of: selectedCategory) { _, _ in
            loadResults()
        }
    }
    
    private func getResultCount(for category: SearchCategory) -> Int {
        return searchResults[category]?.count ?? 0
    }
    
    private func loadResults() {
        isLoading = true
        
        // Simulate loading delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            searchResults = Self.generateMockResults(for: query)
            isLoading = false
        }
    }
    
    private static func generateMockResults(for query: String) -> [SearchCategory: [SearchResultItem]] {
        return [
            .users: [
                SearchResultItem(id: "1", title: "John Doe", subtitle: "@johndoe", category: .users, icon: "person.fill", isOnline: true),
                SearchResultItem(id: "2", title: "Jane Smith", subtitle: "@janesmith", category: .users, icon: "person.fill", isOnline: false),
                SearchResultItem(id: "3", title: "Bob Wilson", subtitle: "@bobwilson", category: .users, icon: "person.fill", isOnline: true)
            ],
            .chats: [
                SearchResultItem(id: "4", title: "AI Development Team", subtitle: "5 members", category: .chats, icon: "bubble.left.and.bubble.right.fill", isOnline: true),
                SearchResultItem(id: "5", title: "Project讨论组", subtitle: "12 members", category: .chats, icon: "bubble.left.and.bubble.right.fill", isOnline: false)
            ],
            .groups: [
                SearchResultItem(id: "6", title: "iOS Developers", subtitle: "128 members", category: .groups, icon: "person.3.fill", isOnline: true),
                SearchResultItem(id: "7", title: "Swift Enthusiasts", subtitle: "256 members", category: .groups, icon: "person.3.fill", isOnline: false)
            ],
            .messages: [
                SearchResultItem(id: "8", title: "How to implement AI?", subtitle: "In: General Chat", category: .messages, icon: "envelope.fill", isOnline: false),
                SearchResultItem(id: "9", title: "API documentation link", subtitle: "In: Dev Team", category: .messages, icon: "envelope.fill", isOnline: false)
            ],
            .files: [
                SearchResultItem(id: "10", title: "project_spec.pdf", subtitle: "2.4 MB", category: .files, icon: "doc.fill", isOnline: false),
                SearchResultItem(id: "11", title: "architecture.png", subtitle: "1.1 MB", category: .files, icon: "photo.fill", isOnline: false)
            ],
            .settings: [
                SearchResultItem(id: "12", title: "Account Settings", subtitle: "Profile, security, privacy", category: .settings, icon: "gear", isOnline: false),
                SearchResultItem(id: "13", title: "Notification Settings", subtitle: "Alerts, sounds, badges", category: .settings, icon: "gear", isOnline: false)
            ]
        ]
    }
}

// MARK: - Search Result Item
struct SearchResultItem: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let category: SearchCategory
    let icon: String
    var isOnline: Bool = false
}

// MARK: - Search Result Row
struct SearchResultRow: View {
    let item: SearchResultItem
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            ZStack {
                Circle()
                    .fill(item.category.color.opacity(0.2))
                    .frame(width: 44, height: 44)
                
                Image(systemName: item.icon)
                    .foregroundColor(item.category.color)
                
                if item.isOnline {
                    Circle()
                        .fill(.green)
                        .frame(width: 12, height: 12)
                        .overlay(
                            Circle()
                                .stroke(.white, lineWidth: 2)
                        )
                        .offset(x: 16, y: 16)
                }
            }
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.body)
                    .fontWeight(.medium)
                    .lineLimit(1)
                
                Text(item.subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
            
            Spacer()
            
            // Action
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        SearchResultPage(query: "AI", viewModel: GlobalSearchViewModel())
    }
}