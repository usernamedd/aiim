package com.aiim.app.data.repository

import com.aiim.app.data.remote.*
import com.aiim.app.domain.model.*
import com.aiim.app.domain.repository.ChatRepository
import com.aiim.app.domain.repository.ContactRepository

class ChatRepositoryImpl : ChatRepository {
    private val api = NetworkModule.apiService

    override suspend fun getChats(): List<Chat> {
        return try {
            val response = api.getChats()
            if (response.isSuccessful) {
                response.body()?.map { it.toDomain() } ?: emptyList()
            } else emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    override suspend fun getMessages(chatId: String): List<Message> {
        return try {
            val response = api.getMessages(chatId)
            if (response.isSuccessful) {
                response.body()?.map { it.toDomain() } ?: emptyList()
            } else emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    override suspend fun sendMessage(chatId: String, content: String): Message {
        val response = api.sendMessage(chatId, SendMessageRequest(content))
        return if (response.isSuccessful) {
            response.body()!!.toDomain()
        } else {
            throw Exception("Failed to send message")
        }
    }

    private fun ChatResponse.toDomain() = Chat(
        id = id,
        participantIds = participantIds,
        lastMessage = lastMessage?.toDomain(),
        updatedAt = updatedAt
    )

    private fun MessageResponse.toDomain() = Message(
        id = id,
        senderId = senderId,
        content = content,
        timestamp = timestamp
    )
}

class ContactRepositoryImpl : ContactRepository {
    private val api = NetworkModule.apiService

    override suspend fun getContacts(): List<User> {
        return try {
            val response = api.getContacts()
            if (response.isSuccessful) {
                response.body()?.map { User(it.id, it.email, it.displayName, it.avatarUrl) } ?: emptyList()
            } else emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
}