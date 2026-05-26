import SwiftUI

// MARK: - P50: Settings Page
struct SettingsPage: View {
    @State private var currentUser: User?
    @State private var isLoading = true
    @State private var showingLogoutConfirm = false
    @State private var showingEditProfile = false
    
    var body: some View {
        NavigationStack {
            List {
                // User Profile Section
                Section {
                    if let user = currentUser {
                        HStack(spacing: 16) {
                            Circle()
                                .fill(Color.blue.opacity(0.2))
                                .frame(width: 60, height: 60)
                                .overlay {
                                    Text(String((user.nickname ?? user.username).prefix(1)).uppercased())
                                        .font(.title2)
                                        .foregroundColor(.blue)
                                }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.nickname ?? user.username)
                                    .font(.headline)
                                Text("@\(user.username)")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            Button(action: { showingEditProfile = true }) {
                                Text("Edit")
                                    .foregroundColor(.blue)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
                
                // Account Section
                Section("Account") {
                    NavigationLink(destination: Text("Privacy Settings")) {
                        Label("Privacy", systemImage: "lock.shield")
                    }
                    
                    NavigationLink(destination: Text("Security Settings")) {
                        Label("Security", systemImage: "key")
                    }
                    
                    NavigationLink(destination: Text("Notification Settings")) {
                        Label("Notifications", systemImage: "bell")
                    }
                }
                
                // App Section
                Section("App") {
                    NavigationLink(destination: Text("Appearance Settings")) {
                        Label("Appearance", systemImage: "paintbrush")
                    }
                    
                    NavigationLink(destination: DomainSwitchPage()) {
                        Label("Domain", systemImage: "globe")
                    }
                    
                    NavigationLink(destination: Text("Storage Settings")) {
                        Label("Storage & Data", systemImage: "externaldrive")
                    }
                    
                    NavigationLink(destination: Text("About AIIM")) {
                        Label("About", systemImage: "info.circle")
                    }
                }
                
                // Logout Section
                Section {
                    Button(action: { showingLogoutConfirm = true }) {
                        Label("Log Out", systemImage: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showingEditProfile) {
                if let user = currentUser {
                    EditProfilePage(user: user, onUpdate: { updatedUser in
                        currentUser = updatedUser
                    })
                }
            }
            .alert("Log Out?", isPresented: $showingLogoutConfirm) {
                Button("Cancel", role: .cancel) { }
                Button("Log Out", role: .destructive) {
                    logout()
                }
            } message: {
                Text("Are you sure you want to log out?")
            }
            .task {
                await loadCurrentUser()
            }
        }
    }
    
    private func loadCurrentUser() async {
        isLoading = true
        currentUser = Storage.getCurrentUser()
        isLoading = false
    }
    
    private func logout() {
        Storage.clearCredentials()
        // Navigate back to login - in a real app, would use navigation state management
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController = UIHostingController(rootView: LoginPage())
        }
    }
}

// MARK: - Edit Profile Page
struct EditProfilePage: View {
    @Environment(\.dismiss) private var dismiss
    
    let user: User
    let onUpdate: (User) -> Void
    
    @State private var nickname: String
    @State private var avatarURL: String
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    init(user: User, onUpdate: @escaping (User) -> Void) {
        self.user = user
        self.onUpdate = onUpdate
        self._nickname = State(initialValue: user.nickname ?? "")
        self._avatarURL = State(initialValue: user.avatarURL ?? "")
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Avatar") {
                    HStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 60, height: 60)
                            .overlay {
                                Text(String((nickname.isEmpty ? user.username : nickname).prefix(1)).uppercased())
                                    .font(.title2)
                                    .foregroundColor(.blue)
                            }
                        
                        TextField("Avatar URL", text: $avatarURL)
                            .textContentType(.URL)
                            .keyboardType(.URL)
                    }
                }
                
                Section("Profile") {
                    TextField("Nickname", text: $nickname)
                }
                
                Section("Account Info") {
                    LabeledContent("Username", value: user.username)
                    LabeledContent("Email", value: user.email)
                }
                
                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveProfile() }
                        .disabled(isLoading)
                }
            }
        }
    }
    
    private func saveProfile() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let userUseCase = UserUseCase()
                let updatedUser = try await userUseCase.updateProfile(
                    nickname: nickname.isEmpty ? nil : nickname,
                    avatarURL: avatarURL.isEmpty ? nil : avatarURL
                )
                Storage.saveCurrentUser(updatedUser)
                onUpdate(updatedUser)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}

#Preview {
    SettingsPage()
}