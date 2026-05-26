import SwiftUI

// MARK: - P01: Login/Register Page
struct LoginPage: View {
    @StateObject private var viewModel = AuthViewModel()
    @State private var isShowingRegister = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()
                
                // Logo
                VStack(spacing: 8) {
                    Image(systemName: "bubble.left.and.bubble.right.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)
                    
                    Text("AIIM")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("AI-powered chat assistant")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                // Login Form
                VStack(spacing: 16) {
                    TextField("Username", text: $viewModel.username)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.username)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    SecureField("Password", text: $viewModel.password)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.password)
                }
                .padding(.horizontal, 32)
                
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
                
                // Login Button
                Button(action: { Task { await viewModel.login() }}) {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Sign In")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .padding(.horizontal, 32)
                .disabled(viewModel.isLoading || viewModel.username.isEmpty || viewModel.password.isEmpty)
                
                // Register Link
                Button(action: { isShowingRegister = true }) {
                    Text("Don't have an account? Sign Up")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
                
                Spacer()
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $isShowingRegister) {
                RegisterPage(viewModel: viewModel)
            }
            .navigationDestination(isPresented: $viewModel.isLoggedIn) {
                MainTabView()
            }
        }
    }
}

// MARK: - Register Page
struct RegisterPage: View {
    @ObservedObject var viewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var nickname = ""
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Text("Create Account")
                    .font(.title)
                    .fontWeight(.bold)
                    .padding(.top, 32)
                
                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                        .keyboardType(.emailAddress)
                    
                    TextField("Nickname (optional)", text: $nickname)
                        .textFieldStyle(.roundedBorder)
                }
                .padding(.horizontal, 32)
                
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
                
                Button(action: { Task { await viewModel.register(email: email, nickname: nickname.isEmpty ? nil : nickname); if viewModel.errorMessage == nil { dismiss() } }}) {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Sign Up")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .padding(.horizontal, 32)
                .disabled(viewModel.isLoading || viewModel.username.isEmpty || viewModel.password.isEmpty || email.isEmpty)
                
                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Auth ViewModel
@MainActor
final class AuthViewModel: ObservableObject {
    @Published var username = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isLoggedIn = false
    
    private let authUseCase: AuthUseCase
    
    init(authUseCase: AuthUseCase = AuthUseCase()) {
        self.authUseCase = authUseCase
        
        // Check if already authenticated
        if authUseCase.isAuthenticated() {
            isLoggedIn = true
        }
    }
    
    func login() async {
        guard !username.isEmpty, !password.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            _ = try await authUseCase.login(username: username, password: password)
            isLoggedIn = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func register(email: String, nickname: String?) async {
        guard !username.isEmpty, !password.isEmpty, !email.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            _ = try await authUseCase.register(username: username, email: email, password: password, nickname: nickname)
            // After successful registration, login automatically
            try await authUseCase.login(username: username, password: password)
            isLoggedIn = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

#Preview {
    LoginPage()
}