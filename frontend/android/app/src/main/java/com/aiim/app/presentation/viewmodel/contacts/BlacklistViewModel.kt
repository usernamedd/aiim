package com.aiim.app.presentation.viewmodel.contacts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class BlacklistedUser(
    val id: String,
    val userId: String,
    val userName: String,
    val userAvatar: String?,
    val blockedAt: Long,
    val reason: String?
)

data class BlacklistUiState(
    val blacklistedUsers: List<BlacklistedUser> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class BlacklistViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(BlacklistUiState())
    val uiState: StateFlow<BlacklistUiState> = _uiState.asStateFlow()

    init {
        loadBlacklist()
    }

    fun loadBlacklist() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            // Mock data
            val mockBlacklist = listOf(
                BlacklistedUser(
                    id = "1",
                    userId = "blocked_001",
                    userName = "恶意用户A",
                    userAvatar = null,
                    blockedAt = System.currentTimeMillis() - 604800000,
                    reason = "发送垃圾信息"
                ),
                BlacklistedUser(
                    id = "2",
                    userId = "blocked_002",
                    userName = "骗子B",
                    userAvatar = null,
                    blockedAt = System.currentTimeMillis() - 259200000,
                    reason = "诈骗嫌疑"
                ),
                BlacklistedUser(
                    id = "3",
                    userId = "blocked_003",
                    userName = "骚扰者C",
                    userAvatar = null,
                    blockedAt = System.currentTimeMillis() - 172800000,
                    reason = null
                )
            )
            _uiState.value = _uiState.value.copy(isLoading = false, blacklistedUsers = mockBlacklist)
        }
    }

    fun unblockUser(userId: String) {
        viewModelScope.launch {
            val updatedList = _uiState.value.blacklistedUsers.filter { it.userId != userId }
            _uiState.value = _uiState.value.copy(blacklistedUsers = updatedList)
        }
    }
}