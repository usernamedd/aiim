package com.aiim.app.presentation.viewmodel.contacts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ContactGroup(
    val id: String,
    val name: String,
    val memberCount: Int,
    val members: List<String>,
    val createdAt: Long,
    val description: String?
)

data class ContactGroupsUiState(
    val groups: List<ContactGroup> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class ContactGroupsViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(ContactGroupsUiState())
    val uiState: StateFlow<ContactGroupsUiState> = _uiState.asStateFlow()

    init {
        loadGroups()
    }

    fun loadGroups() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            // Mock data
            val mockGroups = listOf(
                ContactGroup(
                    id = "1",
                    name = "家人",
                    memberCount = 5,
                    members = listOf("user_1", "user_2", "user_3", "user_4", "user_5"),
                    createdAt = System.currentTimeMillis() - 31536000000,
                    description = "家庭成员"
                ),
                ContactGroup(
                    id = "2",
                    name = "同事",
                    memberCount = 12,
                    members = listOf("user_10", "user_11", "user_12"),
                    createdAt = System.currentTimeMillis() - 15768000000,
                    description = "工作相关联系人"
                ),
                ContactGroup(
                    id = "3",
                    name = "朋友",
                    memberCount = 28,
                    members = listOf("user_20", "user_21", "user_22"),
                    createdAt = System.currentTimeMillis() - 7884000000,
                    description = "朋友圈子"
                ),
                ContactGroup(
                    id = "4",
                    name = "客户",
                    memberCount = 15,
                    members = listOf("user_30", "user_31"),
                    createdAt = System.currentTimeMillis() - 3942000000,
                    description = "商务客户"
                )
            )
            _uiState.value = _uiState.value.copy(isLoading = false, groups = mockGroups)
        }
    }

    fun createGroup(name: String, description: String?) {
        viewModelScope.launch {
            val newGroup = ContactGroup(
                id = System.currentTimeMillis().toString(),
                name = name,
                memberCount = 0,
                members = emptyList(),
                createdAt = System.currentTimeMillis(),
                description = description
            )
            val updatedGroups = _uiState.value.groups + newGroup
            _uiState.value = _uiState.value.copy(groups = updatedGroups)
        }
    }

    fun deleteGroup(groupId: String) {
        viewModelScope.launch {
            val updatedGroups = _uiState.value.groups.filter { it.id != groupId }
            _uiState.value = _uiState.value.copy(groups = updatedGroups)
        }
    }
}