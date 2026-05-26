package com.aiim.app.presentation.viewmodel.contacts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ContactRequest(
    val id: String,
    val userId: String,
    val userName: String,
    val userAvatar: String?,
    val message: String,
    val timestamp: Long
)

data class ContactRequestsUiState(
    val requests: List<ContactRequest> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class ContactRequestsViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(ContactRequestsUiState())
    val uiState: StateFlow<ContactRequestsUiState> = _uiState.asStateFlow()

    init {
        loadRequests()
    }

    fun loadRequests() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            // Mock data
            val mockRequests = listOf(
                ContactRequest(
                    id = "1",
                    userId = "user_101",
                    userName = "张三",
                    userAvatar = null,
                    message = "你好，我是张三，想加你为好友",
                    timestamp = System.currentTimeMillis() - 3600000
                ),
                ContactRequest(
                    id = "2",
                    userId = "user_102",
                    userName = "李四",
                    userAvatar = null,
                    message = "Hello! I'd like to connect with you.",
                    timestamp = System.currentTimeMillis() - 7200000
                ),
                ContactRequest(
                    id = "3",
                    userId = "user_103",
                    userName = "王五",
                    userAvatar = null,
                    message = "您好，我是王五，请通过一下",
                    timestamp = System.currentTimeMillis() - 86400000
                )
            )
            _uiState.value = _uiState.value.copy(isLoading = false, requests = mockRequests)
        }
    }

    fun acceptRequest(requestId: String) {
        viewModelScope.launch {
            val updatedRequests = _uiState.value.requests.filter { it.id != requestId }
            _uiState.value = _uiState.value.copy(requests = updatedRequests)
        }
    }

    fun rejectRequest(requestId: String) {
        viewModelScope.launch {
            val updatedRequests = _uiState.value.requests.filter { it.id != requestId }
            _uiState.value = _uiState.value.copy(requests = updatedRequests)
        }
    }
}