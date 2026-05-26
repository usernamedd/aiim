package com.aiim.app.presentation.viewmodel.search

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class SearchResultUiState(
    val query: String = "",
    val category: String = "All",
    val categories: List<String> = listOf("All", "Stock", "News", "User", "Chat"),
    val selectedCategory: String = "All",
    val results: List<SearchResultItem> = emptyList(),
    val isLoading: Boolean = false
)

data class SearchResultItem(
    val id: String,
    val title: String,
    val description: String,
    val type: String
)

class SearchResultViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(SearchResultUiState())
    val uiState: StateFlow<SearchResultUiState> = _uiState.asStateFlow()

    fun search(query: String, category: String) {
        _uiState.value = _uiState.value.copy(
            query = query,
            category = category,
            isLoading = true
        )

        // Mock data based on category
        val mockResults = getMockResults(query, category)
        _uiState.value = _uiState.value.copy(
            results = mockResults,
            isLoading = false
        )
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        search(_uiState.value.query, category)
    }

    private fun getMockResults(query: String, category: String): List<SearchResultItem> {
        return when (category) {
            "Stock" -> listOf(
                SearchResultItem("1", "$query Inc.", "NASDAQ: $query", "stock"),
                SearchResultItem("2", "$query Corp", "NYSE: $query", "stock"),
                SearchResultItem("3", "$query Ltd", "LSE: $query", "stock")
            )
            "News" -> listOf(
                SearchResultItem("4", "Breaking: $query", "Latest news about $query", "news"),
                SearchResultItem("5", "$query Update", "Market analysis for $query", "news")
            )
            "User" -> listOf(
                SearchResultItem("6", query, "User profile", "user"),
                SearchResultItem("7", "$query User", "Contact: $query@example.com", "user")
            )
            "Chat" -> listOf(
                SearchResultItem("8", "Chat about $query", "Recent conversation", "chat")
            )
            else -> listOf(
                SearchResultItem("1", "$query Inc.", "NASDAQ: $query", "stock"),
                SearchResultItem("4", "Breaking: $query", "Latest news about $query", "news"),
                SearchResultItem("6", query, "User profile", "user"),
                SearchResultItem("8", "Chat about $query", "Recent conversation", "chat")
            )
        }
    }
}

class SearchResultViewModelFactory : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        return SearchResultViewModel() as T
    }
}