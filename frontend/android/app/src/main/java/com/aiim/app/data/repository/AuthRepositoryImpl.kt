package com.aiim.app.data.repository

import android.content.Context
import com.aiim.app.data.remote.NetworkModule
import com.aiim.app.data.remote.LoginRequest
import com.aiim.app.data.remote.RegisterRequest
import com.aiim.app.data.remote.ForgotPasswordRequest
import com.aiim.app.domain.model.AuthResult
import com.aiim.app.domain.model.RegisterResult
import com.aiim.app.domain.model.ForgotPasswordResult
import com.aiim.app.domain.model.User
import com.aiim.app.domain.repository.AuthRepository

class AuthRepositoryImpl(
    private val context: Context,
    private val tokenStorage: TokenStorage
) : AuthRepository {

    private val api = NetworkModule.apiService

    override suspend fun login(email: String, password: String): AuthResult {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                val body = response.body()!!
                if (body.success && body.user != null) {
                    body.token?.let { tokenStorage.saveAuthToken(it) }
                    tokenStorage.saveUser(
                        id = body.user.id,
                        email = body.user.email,
                        displayName = body.user.displayName ?: email.substringBefore("@")
                    )
                    AuthResult(
                        success = true,
                        user = User(
                            id = body.user.id,
                            email = body.user.email,
                            displayName = body.user.displayName ?: email.substringBefore("@")
                        ),
                        token = body.token
                    )
                } else {
                    AuthResult(success = false, errorMessage = body.errorMessage ?: "Login failed")
                }
            } else {
                AuthResult(success = false, errorMessage = "Network error: ${response.code()}")
            }
        } catch (e: Exception) {
            AuthResult(success = false, errorMessage = e.message ?: "Unknown error")
        }
    }

    override suspend fun register(email: String, password: String, displayName: String): RegisterResult {
        return try {
            val response = api.register(RegisterRequest(email, password, displayName))
            if (response.isSuccessful) {
                val body = response.body()!!
                if (body.success && body.user != null) {
                    RegisterResult(
                        success = true,
                        user = User(
                            id = body.user.id,
                            email = body.user.email,
                            displayName = body.user.displayName ?: displayName
                        )
                    )
                } else {
                    RegisterResult(success = false, errorMessage = body.errorMessage ?: "Registration failed")
                }
            } else {
                RegisterResult(success = false, errorMessage = "Network error: ${response.code()}")
            }
        } catch (e: Exception) {
            RegisterResult(success = false, errorMessage = e.message ?: "Unknown error")
        }
    }

    override suspend fun forgotPassword(email: String): ForgotPasswordResult {
        return try {
            val response = api.forgotPassword(ForgotPasswordRequest(email))
            if (response.isSuccessful) {
                ForgotPasswordResult(success = true, message = response.body()?.message)
            } else {
                ForgotPasswordResult(success = false, errorMessage = "Network error: ${response.code()}")
            }
        } catch (e: Exception) {
            ForgotPasswordResult(success = false, errorMessage = e.message ?: "Unknown error")
        }
    }

    override suspend fun logout() {
        tokenStorage.clearAuth()
    }

    override suspend fun getCurrentUser(): User? {
        val token = tokenStorage.getAuthToken() ?: return null
        val id = tokenStorage.getUserId() ?: return null
        val email = tokenStorage.getUserEmail() ?: return null
        val displayName = tokenStorage.getUserDisplayName() ?: email.substringBefore("@")
        return User(id = id, email = email, displayName = displayName)
    }
}