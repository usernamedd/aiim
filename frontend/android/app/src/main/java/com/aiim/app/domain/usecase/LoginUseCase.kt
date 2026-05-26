package com.aiim.app.domain.usecase

import com.aiim.app.domain.model.AuthResult
import com.aiim.app.domain.repository.AuthRepository

class LoginUseCase(private val authRepository: AuthRepository) {
    suspend operator fun invoke(email: String, password: String): AuthResult {
        if (email.isBlank()) {
            return AuthResult(success = false, errorMessage = "Email cannot be empty")
        }
        if (password.isBlank()) {
            return AuthResult(success = false, errorMessage = "Password cannot be empty")
        }
        return authRepository.login(email, password)
    }
}