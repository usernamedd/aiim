package com.aiim.app.presentation.ui.search

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aiim.app.presentation.viewmodel.search.SearchResultViewModel
import com.aiim.app.presentation.viewmodel.search.SearchResultViewModelFactory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchResultScreen(
    query: String,
    category: String,
    onBack: () -> Unit,
    onItemClick: (String) -> Unit,
    viewModel: SearchResultViewModel = viewModel(factory = SearchResultViewModelFactory())
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(query, category) {
        viewModel.search(query, category)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Results: $query") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Category tabs
            ScrollableTabRow(
                selectedTabIndex = uiState.categories.indexOf(uiState.selectedCategory).coerceAtLeast(0),
                modifier = Modifier.fillMaxWidth()
            ) {
                uiState.categories.forEach { cat ->
                    Tab(
                        selected = cat == uiState.selectedCategory,
                        onClick = { viewModel.selectCategory(cat) },
                        text = { Text(cat) }
                    )
                }
            }

            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (uiState.results.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.SearchOff,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No results found",
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
            } else {
                LazyColumn {
                    items(uiState.results) { result ->
                        SearchResultItem(
                            result = result,
                            onClick = { onItemClick(result.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SearchResultItem(
    result: SearchResult,
    onClick: () -> Unit
) {
    ListItem(
        headlineContent = { Text(result.title) },
        supportingContent = { Text(result.description) },
        leadingContent = {
            Icon(
                when (result.type) {
                    "stock" -> Icons.Default.TrendingUp
                    "news" -> Icons.Default.Newspaper
                    "user" -> Icons.Default.Person
                    "chat" -> Icons.Default.Chat
                    else -> Icons.Default.Search
                },
                contentDescription = null
            )
        },
        trailingContent = {
            Text(
                text = result.type.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary
            )
        },
        modifier = Modifier.clickable(onClick = onClick)
    )
}

data class SearchResult(
    val id: String,
    val title: String,
    val description: String,
    val type: String
)