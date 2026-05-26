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
import com.aiim.app.presentation.viewmodel.search.GlobalSearchViewModel
import com.aiim.app.presentation.viewmodel.search.GlobalSearchViewModelFactory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GlobalSearchScreen(
    onBack: () -> Unit,
    onSearchResult: (String, String) -> Unit, // query, category
    viewModel: GlobalSearchViewModel = viewModel(factory = GlobalSearchViewModelFactory())
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search") },
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
            // Search input
            OutlinedTextField(
                value = searchQuery,
                onValueChange = {
                    searchQuery = it
                    viewModel.updateSearchQuery(it)
                },
                placeholder = { Text("Search...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = {
                            searchQuery = ""
                            viewModel.updateSearchQuery("")
                        }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            )

            // Search button
            Button(
                onClick = {
                    if (searchQuery.isNotBlank()) {
                        viewModel.executeSearch()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                enabled = searchQuery.isNotBlank()
            ) {
                Text("Search")
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search history
            if (uiState.searchHistory.isNotEmpty()) {
                Text(
                    text = "Recent Searches",
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
                LazyColumn {
                    items(uiState.searchHistory) { historyItem ->
                        ListItem(
                            headlineContent = { Text(historyItem) },
                            leadingContent = {
                                Icon(Icons.Default.History, contentDescription = null)
                            },
                            trailingContent = {
                                IconButton(onClick = { viewModel.removeFromHistory(historyItem) }) {
                                    Icon(Icons.Default.Close, contentDescription = "Remove")
                                }
                            },
                            modifier = Modifier.clickable {
                                searchQuery = historyItem
                                viewModel.updateSearchQuery(historyItem)
                            }
                        )
                    }
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            // Hot topics
            Text(
                text = "Hot Topics",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            LazyColumn {
                items(uiState.hotTopics) { topic ->
                    ListItem(
                        headlineContent = { Text(topic.title) },
                        supportingContent = { Text(topic.category) },
                        leadingContent = {
                            Icon(
                                when (topic.category) {
                                    "Stock" -> Icons.Default.TrendingUp
                                    "News" -> Icons.Default.Newspaper
                                    "User" -> Icons.Default.Person
                                    else -> Icons.Default.Search
                                },
                                contentDescription = null
                            )
                        },
                        trailingContent = {
                            Icon(
                                Icons.Default.ChevronRight,
                                contentDescription = null
                            )
                        },
                        modifier = Modifier.clickable {
                            onSearchResult(topic.title, topic.category)
                        }
                    )
                }
            }
        }
    }
}

data class HotTopic(
    val title: String,
    val category: String
)