import SwiftUI

// MARK: - P01b: Register Page
struct RegisterPage: View {
    @ObservedObject var viewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var nickname = ""
    @State private var confirmPassword = ""
    @FocusState private var focusedField: Field?
    
    enum Field {
        case email, nickname, password, confirmPassword
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "person.badge.plus")
                            .font(.system(size: 50))
                            .foregroundColor(.blue)
                        
                        Text("Create Account")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text("Join AIIM and start chatting")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 32)
                    
                    // Form
                    VStack(spacing: 16) {
                        // Email field
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Email")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(.roundedBorder)
                                .textContentType(.emailAddress)
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                                .focused($focusedField, equals: .email)
                                .submitLabel(.next)
                                .onSubmit { focusedField = .nickname }
                        }
                        
                        // Nickname field
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Nickname (optional)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            TextField("How should we call you?", text: $nickname)
                                .textFieldStyle(.roundedBorder)
                                .focused($focusedField, equals: .nickname)
                                .submitLabel(.next)
                                .onSubmit { focusedField = .password }
                        }
                        
                        // Password field
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Password")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            SecureField("Create a password", text: $viewModel.password)
                                .textFieldStyle(.roundedBorder)
                                .textContentType(.newPassword)
                                .focused($focusedField, equals: .password)
                                .submitLabel(.next)
                                .onSubmit { focusedField = .confirmPassword }
                        }
                        
                        // Confirm Password field
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Confirm Password")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            SecureField("Confirm your password", text: $confirmPassword)
                                .textFieldStyle(.roundedBorder)
                                .textContentType(.newPassword)
                                .focused($focusedField, equals: .confirmPassword)
                                .submitLabel(.go)
                                .onSubmit { register() }
                        }
                    }
                    .padding(.horizontal, 32)
                    
                    // Error message
                    if let error = viewModel.errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                            Text(error)
                        }
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal, 32)
                    }
                    
                    // Password requirements
                    if !viewModel.password.isEmpty {
                        PasswordRequirementsView(password: viewModel.password)
                            .padding(.horizontal, 32)
                    }
                    
                    // Register Button
                    Button(action: register) {
                        if viewModel.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("Create Account")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isFormValid ? Color.blue : Color.gray)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                    .padding(.horizontal, 32)
                    .disabled(!isFormValid || viewModel.isLoading)
                    
                    // Terms
                    Text("By creating an account, you agree to our Terms of Service and Privacy Policy")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                    
                    Spacer(minLength: 32)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                focusedField = .email
            }
        }
    }
    
    private var isFormValid: Bool {
        !viewModel.username.isEmpty &&
        !viewModel.password.isEmpty &&
        !email.isEmpty &&
        viewModel.password == confirmPassword &&
        viewModel.password.count >= 6
    }
    
    private func register() {
        guard isFormValid else { return }
        
        Task {
            await viewModel.register(email: email, nickname: nickname.isEmpty ? nil : nickname)
            if viewModel.errorMessage == nil {
                dismiss()
            }
        }
    }
}

// MARK: - Password Requirements View
struct PasswordRequirementsView: View {
    let password: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            RequirementRow(
                text: "At least 6 characters",
                met: password.count >= 6
            )
            RequirementRow(
                text: "Contains a number",
                met: password.rangeOfCharacter(from: .decimalDigits) != nil
            )
            RequirementRow(
                text: "Contains uppercase letter",
                met: password.rangeOfCharacter(from: .uppercaseLetters) != nil
            )
        }
        .padding(.vertical, 8)
    }
}

struct RequirementRow: View {
    let text: String
    let met: Bool
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: met ? "checkmark.circle.fill" : "circle")
                .foregroundColor(met ? .green : .secondary)
                .font(.caption)
            Text(text)
                .font(.caption)
                .foregroundColor(met ? .primary : .secondary)
        }
    }
}

// MARK: - Standalone Register Page (for navigation)
struct RegisterPageStandalone: View {
    @StateObject private var viewModel = AuthViewModel()
    @State private var email = ""
    @State private var nickname = ""
    @State private var confirmPassword = ""
    @FocusState private var focusedField: RegisterPage.Field?
    
    enum Field {
        case email, nickname, password, confirmPassword
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "person.badge.plus")
                            .font(.system(size: 50))
                            .foregroundColor(.blue)
                        
                        Text("Create Account")
                            .font(.title)
                            .fontWeight(.bold)
                    }
                    .padding(.top, 32)
                    
                    // Form
                    VStack(spacing: 16) {
                        FormField(
                            title: "Username",
                            placeholder: "Choose a username",
                            text: $viewModel.username,
                            field: .email,
                            focusedField: $focusedField
                        )
                        
                        FormField(
                            title: "Email",
                            placeholder: "Enter your email",
                            text: $email,
                            field: .email,
                            focusedField: $focusedField,
                            keyboardType: .emailAddress
                        )
                        
                        FormField(
                            title: "Nickname (optional)",
                            placeholder: "How should we call you?",
                            text: $nickname,
                            field: .nickname,
                            focusedField: $focusedField
                        )
                        
                        SecureField("Password", text: $viewModel.password)
                            .textFieldStyle(.roundedBorder)
                            .focused($focusedField, equals: .password)
                        
                        SecureField("Confirm Password", text: $confirmPassword)
                            .textFieldStyle(.roundedBorder)
                            .focused($focusedField, equals: .confirmPassword)
                    }
                    .padding(.horizontal, 32)
                    
                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                    
                    Button(action: register) {
                        if viewModel.isLoading {
                            ProgressView()
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
                    .disabled(!isFormValid || viewModel.isLoading)
                    
                    Spacer()
                }
            }
            .navigationTitle("Register")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private var isFormValid: Bool {
        !viewModel.username.isEmpty &&
        !viewModel.password.isEmpty &&
        !email.isEmpty &&
        viewModel.password == confirmPassword
    }
    
    private func register() {
        guard isFormValid else { return }
        Task {
            await viewModel.register(email: email, nickname: nickname.isEmpty ? nil : nickname)
        }
    }
}

// MARK: - Form Field Component
struct FormField: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    var field: RegisterPage.Field
    var focusedField: FocusState<RegisterPage.Field?>.Binding
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            TextField(placeholder, text: $text)
                .textFieldStyle(.roundedBorder)
                .keyboardType(keyboardType)
                .autocapitalization(.none)
                .focused(focusedField, equals: field)
        }
    }
}

#Preview {
    RegisterPage(viewModel: AuthViewModel())
}