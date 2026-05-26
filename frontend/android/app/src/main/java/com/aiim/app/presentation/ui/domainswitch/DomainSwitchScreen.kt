package com.aiim.app.presentation.ui.domainswitch

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Domain
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aiim.app.presentation.viewmodel.domainswitch.DomainSwitchViewModel
import com.aiim.app.presentation.viewmodel.domainswitch.DomainSwitchViewModelFactory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DomainSwitchScreen(
    onBack: () -> Unit,
    onDomainSelected: (String) -> Unit,
    viewModel: DomainSwitchViewModel = viewModel(factory = DomainSwitchViewModelFactory())
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var newDomainText by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Switch Domain") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.Domain, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showAddDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Domain")
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
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                LazyColumn {
                    items(uiState.domains) { domain ->
                        DomainListItem(
                            domain = domain,
                            isSelected = domain == uiState.selectedDomain,
                            onSelect = {
                                viewModel.selectDomain(domain)
                                onDomainSelected(domain)
                            },
                            onDelete = { viewModel.deleteDomain(domain) }
                        )
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Add Domain") },
            text = {
                OutlinedTextField(
                    value = newDomainText,
                    onValueChange = { newDomainText = it },
                    label = { Text("Domain URL") },
                    placeholder = { Text("https://api.example.com") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (newDomainText.isNotBlank()) {
                            viewModel.addDomain(newDomainText)
                            newDomainText = ""
                            showAddDialog = false
                        }
                    }
                ) {
                    Text("Add")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun DomainListItem(
    domain: String,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onDelete: () -> Unit
) {
    ListItem(
        headlineContent = { Text(domain) },
        leadingContent = {
            Icon(
                Icons.Default.Domain,
                contentDescription = null,
                tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
            )
        },
        trailingContent = {
            Row {
                if (isSelected) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = "Selected",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        modifier = Modifier.clickable(onClick = onSelect)
    )
}