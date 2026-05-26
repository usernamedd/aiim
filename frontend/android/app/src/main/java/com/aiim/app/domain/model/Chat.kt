package com.aiim.app.domain.model

data class Chat(
    val id: String,
    val participantIds: List<String>,
    val lastMessage: Message?,
    val updatedAt: String
)

data class Message(
    val id: String,
    val senderId: String,
    val content: String,
    val timestamp: String
)

data class RegisterResult(
    val success: Boolean,
    val user: User? = null,
    val errorMessage: String? = null
)

data class ForgotPasswordResult(
    val success: Boolean,
    val message: String? = null,
    val errorMessage: String? = null
)