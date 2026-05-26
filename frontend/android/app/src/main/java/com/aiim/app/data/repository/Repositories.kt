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

/**
 * Mock implementation of ChatRepository for testing
 * Provides user1/user2 mock data with 2-3 chat rooms
 */
class MockChatRepository : ChatRepository {
    private val currentUserId = "user1"
    private val user2 = User("user2", "user2@example.com", "User Two")
    private val user3 = User("user3", "user3@example.com", "User Three")
    
    private val mockMessages = mutableListOf(
        Message("msg1", "user2", "Hey, how are you?", "10:30"),
        Message("msg2", "user1", "I'm good, thanks!", "10:32"),
        Message("msg3", "user2", "Are you coming to the meeting?", "10:33"),
        Message("msg4", "user1", "Yes, I'll be there", "10:35"),
        Message("msg5", "user2", "Great see you then!", "10:36")
    ).toMutableList()
    
    private val mockChats = listOf(
        Chat(
            id = "chat1",
            participantIds = listOf(currentUserId, "user2"),
            lastMessage = mockMessages.lastOrNull(),
            updatedAt = "10:36",
            unreadCount = 2
        ),
        Chat(
            id = "chat2",
            participantIds = listOf(currentUserId, "user3"),
            lastMessage = Message("msg6", "user3", "The project is ready for review", "09:45"),
            updatedAt = "09:45",
            unreadCount = 1
        ),
        Chat(
            id = "chat3",
            participantIds = listOf(currentUserId, "user2"),
            lastMessage = Message("msg7", "user2", "Check out this link", "Yesterday"),
            updatedAt = "Yesterday",
            unreadCount = 0
        )
    )

    private var messageIdCounter = 100

    override suspend fun getChats(): List<Chat> {
        kotlinx.coroutines.delay(300) // Simulate network delay
        return mockChats
    }

    override suspend fun getMessages(chatId: String): List<Message> {
        kotlinx.coroutines.delay(200)
        return when (chatId) {
            "chat1" -> mockMessages.toList()
            "chat2" -> listOf(
                Message("msg6", "user3", "The project is ready for review", "09:45"),
                Message("msg8", "user1", "Can you send me the details?", "09:46"),
                Message("msg9", "user3", "Sure, I'll share it shortly", "09:47")
            )
            "chat3" -> listOf(
                Message("msg7", "user2", "Check out this link", "Yesterday"),
                Message("msg10", "user1", "Thanks for sharing!", "Yesterday")
            )
            else -> emptyList()
        }
    }

    override suspend fun sendMessage(chatId: String, content: String): Message {
        kotlinx.coroutines.delay(150)
        val newMessage = Message(
            id = "msg${++messageIdCounter}",
            senderId = currentUserId,
            content = content,
            timestamp = "Now"
        )
        mockMessages.add(newMessage)
        return newMessage
    }
}

// Mock for contacts
class MockContactRepository : ContactRepository {
    private val contacts = listOf(
        User("user2", "user2@example.com", "User Two"),
        User("user3", "user3@example.com", "User Three"),
        User("user4", "user4@example.com", "User Four"),
        User("user5", "user5@example.com", "User Five")
    )

    override suspend fun getContacts(): List<User> {
        kotlinx.coroutines.delay(200)
        return contacts
    }
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