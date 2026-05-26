package com.aiim.app.data.remote

import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth endpoints
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<MessageResponse>

    // User endpoints
    @GET("users/me")
    suspend fun getCurrentUser(): Response<UserResponse>

    @GET("users")
    suspend fun getUsers(): Response<List<UserResponse>>

    @GET("users/{id}")
    suspend fun getUser(@Path("id") userId: String): Response<UserResponse>

    // Chat endpoints
    @GET("chats")
    suspend fun getChats(): Response<List<ChatResponse>>

    @GET("chats/{id}/messages")
    suspend fun getMessages(@Path("id") chatId: String): Response<List<MessageResponse>>

    @POST("chats/{id}/messages")
    suspend fun sendMessage(@Path("id") chatId: String, @Body request: SendMessageRequest): Response<MessageResponse>

    // Contacts
    @GET("contacts")
    suspend fun getContacts(): Response<List<UserResponse>>
}

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val email: String, val password: String, val displayName: String)
data class ForgotPasswordRequest(val email: String)
data class SendMessageRequest(val content: String)

data class AuthResponse(
    val success: Boolean,
    val token: String?,
    val user: UserResponse?,
    val errorMessage: String?
)

data class UserResponse(
    val id: String,
    val email: String,
    val displayName: String,
    val avatarUrl: String?
)

data class ChatResponse(
    val id: String,
    val participantIds: List<String>,
    val lastMessage: MessageResponse?,
    val updatedAt: String
)

data class MessageResponse(
    val id: String,
    val senderId: String,
    val content: String,
    val timestamp: String
)

data class ApiMessageResponse(
    val message: String?
)