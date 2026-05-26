package com.aiim.app.domain.repository

import com.aiim.app.domain.model.Chat
import com.aiim.app.domain.model.Message
import com.aiim.app.domain.model.User

interface ChatRepository {
    suspend fun getChats(): List<Chat>
    suspend fun getMessages(chatId: String): List<Message>
    suspend fun sendMessage(chatId: String, content: String): Message
}

interface ContactRepository {
    suspend fun getContacts(): List<User>
}