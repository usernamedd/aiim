package com.aiim.app.domain.model

data class User(
    val id: String,
    val email: String,
    val displayName: String,
    val avatarUrl: String? = null
)

data class AuthResult(
    val success: Boolean,
    val user: User? = null,
    val token: String? = null,
    val errorMessage: String? = null
)