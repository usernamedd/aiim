package com.aiim.app.presentation.viewmodel.search

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class GlobalSearchUiState(
    val searchQuery: String = "",
    val searchHistory: List<String> = listOf(
        "AAPL stock",
        "Tesla news",
        "John Doe"
    ),
    val hotTopics: List<HotTopic> = listOf(
        HotTopic("Apple Inc.", "Stock"),
        HotTopic("Tesla Motors", "Stock"),
        HotTopic("AI Technology", "News"),
        HotTopic("Market Update", "News"),
        HotTopic("John Smith", "User"),
        HotTopic("Jane Wilson", "User")
    ),
    val isLoading: Boolean = false
)

data class HotTopic(
    val title: String,
    val category: String
)

class GlobalSearchViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(GlobalSearchUiState())
    val uiState: StateFlow<GlobalSearchUiState> = _uiState.asStateFlow()

    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun executeSearch() {
        val query = _uiState.value.searchQuery
        if (query.isNotBlank()) {
            addToHistory(query)
        }
        _uiState.value = _uiState.value.copy(isLoading = true)
        // Simulate search completion
        _uiState.value = _uiState.value.copy(isLoading = false)
    }

    private fun addToHistory(query: String) {
        val history = _uiState.value.searchHistory.toMutableList()
        if (!history.contains(query)) {
            history.add(0, query)
            if (history.size > 10) {
                history.removeLast()
            }
            _uiState.value = _uiState.value.copy(searchHistory = history)
        }
    }

    fun removeFromHistory(query: String) {
        val history = _uiState.value.searchHistory.toMutableList()
        history.remove(query)
        _uiState.value = _uiState.value.copy(searchHistory = history)
    }
}

class GlobalSearchViewModelFactory : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        return GlobalSearchViewModel() as T
    }
}