package com.aiim.app.presentation.ui.blacklist

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aiim.app.presentation.viewmodel.contacts.BlacklistedUser
import com.aiim.app.presentation.viewmodel.contacts.BlacklistViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BlacklistScreen(
    onBack: () -> Unit,
    viewModel: BlacklistViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var userToUnblock by remember { mutableStateOf<BlacklistedUser?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("黑名单") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                uiState.blacklistedUsers.isEmpty() -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "黑名单为空",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.blacklistedUsers) { user ->
                            BlacklistItem(
                                user = user,
                                onUnblock = { userToUnblock = user }
                            )
                        }
                    }
                }
            }
        }
    }

    userToUnblock?.let { user ->
        AlertDialog(
            onDismissRequest = { userToUnblock = null },
            title = { Text("解除拉黑") },
            text = { Text("确定要解除对 ${user.userName} 的拉黑吗？") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.unblockUser(user.userId)
                        userToUnblock = null
                    }
                ) {
                    Text("确定")
                }
            },
            dismissButton = {
                TextButton(onClick = { userToUnblock = null }) {
                    Text("取消")
                }
            }
        )
    }
}

@Composable
private fun BlacklistItem(
    user: BlacklistedUser,
    onUnblock: () -> Unit
) {
    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    val dateStr = dateFormat.format(Date(user.blockedAt))

    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Person,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = MaterialTheme.colorScheme.error
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = user.userName,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "拉黑时间: $dateStr",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                user.reason?.let {
                    Text(
                        text = "原因: $it",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            IconButton(onClick = onUnblock) {
                Icon(
                    Icons.Default.Block,
                    contentDescription = "解除拉黑",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}