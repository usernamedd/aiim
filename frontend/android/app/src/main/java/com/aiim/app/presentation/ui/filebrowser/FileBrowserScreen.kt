package com.aiim.app.presentation.ui.filebrowser

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
import com.aiim.app.presentation.viewmodel.FileBrowserViewModel
import com.aiim.app.presentation.viewmodel.FileNode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FileBrowserScreen(
    onBack: () -> Unit,
    viewModel: FileBrowserViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("File Browser") },
                navigationIcon = {
                    IconButton(onClick = {
                        viewModel.goBack()
                        onBack()
                    }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // File tree panel
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
            ) {
                Text(
                    text = uiState.currentPath,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(8.dp)
                )
                HorizontalDivider()

                LazyColumn {
                    items(uiState.files) { file ->
                        FileTreeItem(
                            file = file,
                            onClick = {
                                if (file.isDirectory) {
                                    viewModel.navigateToDirectory(file)
                                } else {
                                    viewModel.selectFile(file)
                                }
                            }
                        )
                    }
                }
            }

            // Preview panel
            if (uiState.selectedFile != null) {
                VerticalDivider()
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .padding(8.dp)
                ) {
                    Text(
                        text = uiState.selectedFile!!.name,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    HorizontalDivider()
                    Text(
                        text = uiState.fileContent,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun FileTreeItem(
    file: FileNode,
    onClick: () -> Unit
) {
    ListItem(
        headlineContent = { Text(file.name) },
        leadingContent = {
            Icon(
                imageVector = if (file.isDirectory) Icons.Default.Folder else Icons.Default.Description,
                contentDescription = null
            )
        },
        modifier = Modifier.clickable(onClick = onClick)
    )
}