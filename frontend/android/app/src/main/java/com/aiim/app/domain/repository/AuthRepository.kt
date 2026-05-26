package com.aiim.app.domain.repository

import com.aiim.app.domain.model.AuthResult
import com.aiim.app.domain.model.ForgotPasswordResult
import com.aiim.app.domain.model.RegisterResult
import com.aiim.app.domain.model.User

interface AuthRepository {
    suspend fun login(email: String, password: String): AuthResult
    suspend fun register(email: String, password: String, displayName: String): RegisterResult
    suspend fun forgotPassword(email: String): ForgotPasswordResult
    suspend fun logout()
    suspend fun getCurrentUser(): User?
}