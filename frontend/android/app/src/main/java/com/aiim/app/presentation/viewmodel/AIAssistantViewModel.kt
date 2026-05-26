package com.aiim.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class Message(
    val id: String,
    val content: String,
    val isUser: Boolean,
    val timestamp: String
)

data class AIAssistantState(
    val messages: List<Message> = emptyList(),
    val inputText: String = "",
    val isLoading: Boolean = false
)

class AIAssistantViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AIAssistantState())
    val uiState: StateFlow<AIAssistantState> = _uiState.asStateFlow()

    init {
        loadMockMessages()
    }

    private fun loadMockMessages() {
        _uiState.value = AIAssistantState(
            messages = listOf(
                Message(
                    id = "1",
                    content = "Hello! I'm your AI coding assistant. How can I help you today?",
                    isUser = false,
                    timestamp = "10:00"
                ),
                Message(
                    id = "2",
                    content = "Can you explain how to implement a binary search tree?",
                    isUser = true,
                    timestamp = "10:02"
                ),
                Message(
                    id = "3",
                    content = "A Binary Search Tree (BST) is a data structure where each node has at most two children. For any node, all nodes in its left subtree have smaller values, and all nodes in its right subtree have larger values.\n\nHere's a basic implementation in Kotlin:\n\n```kotlin\nclass TreeNode<T: Comparable<T>>(\n    var value: T,\n    var left: TreeNode<T>? = null,\n    var right: TreeNode<T>? = null\n)\n\nfun insert(root: TreeNode<T>?, value: T): TreeNode<T> {\n    if (root == null) return TreeNode(value)\n    if (value < root.value) {\n        root.left = insert(root.left, value)\n    } else {\n        root.right = insert(root.right, value)\n    }\n    return root\n}\n```\n\nWould you like me to explain any specific part in more detail?",
                    isUser = false,
                    timestamp = "10:03"
                )
            )
        )
    }

    fun updateInput(text: String) {
        _uiState.value = _uiState.value.copy(inputText = text)
    }

    fun sendMessage() {
        val text = _uiState.value.inputText.trim()
        if (text.isEmpty()) return

        val userMessage = Message(
            id = System.currentTimeMillis().toString(),
            content = text,
            isUser = true,
            timestamp = "Now"
        )

        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + userMessage,
            inputText = "",
            isLoading = true
        )

        // Simulate AI response
        _uiState.value = _uiState.value.copy(isLoading = false)
    }
}