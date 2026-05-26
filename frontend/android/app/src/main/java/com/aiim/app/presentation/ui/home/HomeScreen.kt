package com.aiim.app.presentation.ui.home

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
import com.aiim.app.domain.model.Chat
import com.aiim.app.presentation.viewmodel.HomeViewModel
import com.aiim.app.presentation.viewmodel.HomeViewModelFactory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToChat: (String) -> Unit,
    onNavigateToContacts: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToFileBrowser: () -> Unit,
    onNavigateToDebugConsole: () -> Unit,
    onNavigateToDiffCompare: () -> Unit,
    onNavigateToAIAssistant: () -> Unit,
    onNavigateToDashboard: () -> Unit = {},
    onNavigateToContactRequests: () -> Unit = {},
    onNavigateToBlacklist: () -> Unit = {},
    onNavigateToContactGroups: () -> Unit = {},
    viewModel: HomeViewModel = viewModel(factory = HomeViewModelFactory())
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AIIM") },
                actions = {
                    IconButton(onClick = onNavigateToContacts) {
                        Icon(Icons.Default.Contacts, contentDescription = "Contacts")
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") },
                    selected = true,
                    onClick = { }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Folder, contentDescription = "Files") },
                    label = { Text("Files") },
                    selected = false,
                    onClick = onNavigateToFileBrowser
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.BugReport, contentDescription = "Debug") },
                    label = { Text("Debug") },
                    selected = false,
                    onClick = onNavigateToDebugConsole
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Compare, contentDescription = "Diff") },
                    label = { Text("Diff") },
                    selected = false,
                    onClick = onNavigateToDiffCompare
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "AI") },
                    label = { Text("AI") },
                    selected = false,
                    onClick = onNavigateToAIAssistant
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Text(
                text = "Welcome, ${uiState.userName}",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(16.dp)
            )

            // Software Engineering Section
            Text(
                text = "Software Engineering",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SoftwareEngineeringCard(
                    icon = Icons.Default.Folder,
                    title = "Files",
                    onClick = onNavigateToFileBrowser,
                    modifier = Modifier.weight(1f)
                )
                SoftwareEngineeringCard(
                    icon = Icons.Default.BugReport,
                    title = "Debug",
                    onClick = onNavigateToDebugConsole,
                    modifier = Modifier.weight(1f)
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SoftwareEngineeringCard(
                    icon = Icons.Default.Compare,
                    title = "Diff",
                    onClick = onNavigateToDiffCompare,
                    modifier = Modifier.weight(1f)
                )
                SoftwareEngineeringCard(
                    icon = Icons.Default.AutoAwesome,
                    title = "AI",
                    onClick = onNavigateToAIAssistant,
                    modifier = Modifier.weight(1f)
                )
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))

            // Finance Section (P40)
            Text(
                text = "Finance",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SoftwareEngineeringCard(
                    icon = Icons.Default.Dashboard,
                    title = "Dashboard",
                    onClick = onNavigateToDashboard,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.weight(1f))
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))

            // Contact Management Section (P22)
            Text(
                text = "Contact Management",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SoftwareEngineeringCard(
                    icon = Icons.Default.PersonAdd,
                    title = "Requests",
                    onClick = onNavigateToContactRequests,
                    modifier = Modifier.weight(1f)
                )
                SoftwareEngineeringCard(
                    icon = Icons.Default.Block,
                    title = "Blacklist",
                    onClick = onNavigateToBlacklist,
                    modifier = Modifier.weight(1f)
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SoftwareEngineeringCard(
                    icon = Icons.Default.Group,
                    title = "Groups",
                    onClick = onNavigateToContactGroups,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.weight(1f))
            }

            Text(
                text = "Recent Chats",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )

            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (uiState.chats.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No conversations yet")
                }
            } else {
                LazyColumn {
                    items(uiState.chats) { chat ->
                        ChatListItem(
                            chat = chat,
                            onClick = { onNavigateToChat(chat.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SoftwareEngineeringCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun ChatListItem(
    chat: Chat,
    onClick: () -> Unit
) {
    ListItem(
        headlineContent = { Text(chat.lastMessage?.content ?: "No messages") },
        supportingContent = { Text(chat.lastMessage?.timestamp ?: "") },
        leadingContent = {
            Icon(Icons.Default.Chat, contentDescription = null)
        },
        modifier = Modifier.clickable(onClick = onClick)
    )
}