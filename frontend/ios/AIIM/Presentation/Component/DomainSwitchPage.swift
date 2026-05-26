import SwiftUI

// MARK: - P51: Domain Switch Page
struct DomainSwitchPage: View {
    @StateObject private var viewModel = DomainSwitchViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            List {
                Section("Current Domain") {
                    HStack {
                        Image(systemName: "globe")
                            .foregroundColor(.blue)
                        Text(viewModel.currentDomain)
                            .fontWeight(.medium)
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    }
                    .padding(.vertical, 4)
                }
                
                Section("Available Domains") {
                    ForEach(viewModel.domains) { domain in
                        Button(action: {
                            viewModel.switchTo(domain: domain)
                        }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(domain.name)
                                        .foregroundColor(.primary)
                                    Text(domain.url)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                if domain.id == viewModel.currentDomainId {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.green)
                                } else {
                                    Image(systemName: "circle")
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                
                Section {
                    Button(action: {
                        viewModel.showAddDomain = true
                    }) {
                        Label("Add Custom Domain", systemImage: "plus.circle")
                            .foregroundColor(.blue)
                    }
                }
            }
            .navigationTitle("Switch Domain")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
            .sheet(isPresented: $viewModel.showAddDomain) {
                AddDomainPage(viewModel: viewModel)
            }
            .alert("Domain Changed", isPresented: $viewModel.showSwitchSuccess) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Successfully switched to \(viewModel.currentDomain)")
            }
        }
    }
}

// MARK: - Add Domain Page
struct AddDomainPage: View {
    @ObservedObject var viewModel: DomainSwitchViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var domainName = ""
    @State private var domainURL = ""
    @State private var isValidURL = true
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Domain Info") {
                    TextField("Domain Name (e.g., US Server)", text: $domainName)
                    TextField("Domain URL (e.g., https://api.example.com)", text: $domainURL)
                        .textContentType(.URL)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                        .onChange(of: domainURL) { _, newValue in
                            isValidURL = isValidURLString(newValue)
                        }
                    
                    if !isValidURL {
                        Text("Please enter a valid URL")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Add Domain")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        viewModel.addDomain(name: domainName, url: domainURL)
                        dismiss()
                    }
                    .disabled(domainName.isEmpty || domainURL.isEmpty || !isValidURL)
                }
            }
        }
    }
    
    private func isValidURLString(_ string: String) -> Bool {
        if let url = URL(string: string) {
            return url.scheme != nil && url.host != nil
        }
        return false
    }
}

// MARK: - Domain Model
struct Domain: Codable, Identifiable, Equatable {
    let id: String
    var name: String
    var url: String
    var isDefault: Bool
    
    enum CodingKeys: String, CodingKey {
        case id, name, url
        case isDefault = "is_default"
    }
}

// MARK: - Domain Switch ViewModel
@MainActor
final class DomainSwitchViewModel: ObservableObject {
    @Published var domains: [Domain] = []
    @Published var currentDomainId: String = ""
    @Published var currentDomain: String = ""
    @Published var showAddDomain = false
    @Published var showSwitchSuccess = false
    
    init() {
        loadMockData()
    }
    
    func loadMockData() {
        // Mock domains
        domains = [
            Domain(id: "us-east", name: "US East", url: "https://us-east.api.aiim.io", isDefault: true),
            Domain(id: "us-west", name: "US West", url: "https://us-west.api.aiim.io", isDefault: false),
            Domain(id: "eu-central", name: "EU Central", url: "https://eu.api.aiim.io", isDefault: false),
            Domain(id: "asia-pacific", name: "Asia Pacific", url: "https://asia.api.aiim.io", isDefault: false),
            Domain(id: "custom-1", name: "Custom Server", url: "https://custom.api.example.com", isDefault: false)
        ]
        currentDomainId = "us-east"
        currentDomain = "US East"
    }
    
    func switchTo(domain: Domain) {
        currentDomainId = domain.id
        currentDomain = domain.name
        showSwitchSuccess = true
    }
    
    func addDomain(name: String, url: String) {
        let newDomain = Domain(
            id: UUID().uuidString,
            name: name,
            url: url,
            isDefault: false
        )
        domains.append(newDomain)
    }
}

// MARK: - Preview
#Preview {
    DomainSwitchPage()
}