package com.aiim.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aiim.app.data.repository.ChatRepositoryImpl
import com.aiim.app.domain.model.Message
import com.aiim.app.domain.repository.ChatRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PrivateChatUiState(
    val chatId: String = "",
    val currentUserId: String = "user_123", // In real app, get from session
    val messages: List<Message> = emptyList(),
    val isLoading: Boolean = false,
    val isSending: Boolean = false,
    val errorMessage: String? = null
)

class PrivateChatViewModel(
    private val chatId: String,
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PrivateChatUiState(chatId = chatId))
    val uiState: StateFlow<PrivateChatUiState> = _uiState.asStateFlow()

    init {
        loadMessages()
    }

    fun loadMessages() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val messages = chatRepository.getMessages(chatId)
            _uiState.value = _uiState.value.copy(isLoading = false, messages = messages)
        }
    }

    fun sendMessage(content: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true)
            try {
                val message = chatRepository.sendMessage(chatId, content)
                _uiState.value = _uiState.value.copy(
                    isSending = false,
                    messages = _uiState.value.messages + message
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSending = false,
                    errorMessage = e.message
                )
            }
        }
    }
}

class PrivateChatViewModelFactory(private val chatId: String) : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        return PrivateChatViewModel(chatId, ChatRepositoryImpl()) as T
    }
}