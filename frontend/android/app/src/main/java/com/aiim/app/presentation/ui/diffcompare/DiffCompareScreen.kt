package com.aiim.app.presentation.ui.diffcompare

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aiim.app.presentation.viewmodel.DiffCompareViewModel
import com.aiim.app.presentation.viewmodel.DiffLine
import com.aiim.app.presentation.viewmodel.DiffLineType
import com.aiim.app.presentation.viewmodel.DiffViewMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiffCompareScreen(
    onBack: () -> Unit,
    viewModel: DiffCompareViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Diff Compare") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.toggleViewMode() }) {
                        Icon(
                            imageVector = if (uiState.viewMode == DiffViewMode.SPLIT)
                                Icons.Default.ViewColumn else Icons.Default.ViewList,
                            contentDescription = "Toggle View"
                        )
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
            // File selector
            if (uiState.files.size > 1) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(8.dp)
                ) {
                    uiState.files.forEach { file ->
                        FilterChip(
                            selected = file == uiState.selectedFile,
                            onClick = { viewModel.selectFile(file) },
                            label = { Text(file.name) },
                            modifier = Modifier.padding(end = 8.dp)
                        )
                    }
                }
            }

            // Diff content
            uiState.selectedFile?.let { file ->
                when (uiState.viewMode) {
                    DiffViewMode.SPLIT -> SplitDiffView(file = file)
                    DiffViewMode.UNIFIED -> UnifiedDiffView(file = file)
                }
            }
        }
    }
}

@Composable
private fun SplitDiffView(file: com.aiim.app.presentation.viewmodel.DiffFile) {
    Row(
        modifier = Modifier.fillMaxSize()
    ) {
        // Old content
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight()
                .background(Color.Red.copy(alpha = 0.1f))
                .padding(8.dp)
        ) {
            Text(
                text = "Old: ${file.name}",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            LazyColumn {
                itemsIndexed(file.oldContent) { index, line ->
                    Row {
                        Text(
                            text = "${index + 1}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray,
                            modifier = Modifier.width(30.dp)
                        )
                        Text(
                            text = line,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }

        VerticalDivider()

        // New content
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight()
                .background(Color.Green.copy(alpha = 0.1f))
                .padding(8.dp)
        ) {
            Text(
                text = "New: ${file.name}",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            LazyColumn {
                itemsIndexed(file.newContent) { index, line ->
                    Row {
                        Text(
                            text = "${index + 1}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray,
                            modifier = Modifier.width(30.dp)
                        )
                        Text(
                            text = line,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun UnifiedDiffView(file: com.aiim.app.presentation.viewmodel.DiffFile) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(8.dp)
    ) {
        Text(
            text = "Unified: ${file.name}",
            style = MaterialTheme.typography.titleSmall,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        LazyColumn {
            itemsIndexed(file.diffLines) { _, diffLine ->
                DiffLineItem(diffLine = diffLine)
            }
        }
    }
}

@Composable
private fun DiffLineItem(diffLine: DiffLine) {
    val backgroundColor = when (diffLine.type) {
        DiffLineType.ADDED -> Color.Green.copy(alpha = 0.2f)
        DiffLineType.REMOVED -> Color.Red.copy(alpha = 0.2f)
        DiffLineType.UNCHANGED -> Color.Transparent
    }

    val prefix = when (diffLine.type) {
        DiffLineType.ADDED -> "+"
        DiffLineType.REMOVED -> "-"
        DiffLineType.UNCHANGED -> " "
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(backgroundColor)
            .padding(horizontal = 4.dp, vertical = 2.dp)
    ) {
        Text(
            text = "${diffLine.lineNumber}",
            style = MaterialTheme.typography.bodySmall,
            color = Color.Gray,
            modifier = Modifier.width(40.dp)
        )
        Text(
            text = prefix,
            style = MaterialTheme.typography.bodySmall,
            color = when (diffLine.type) {
                DiffLineType.ADDED -> Color.Green
                DiffLineType.REMOVED -> Color.Red
                DiffLineType.UNCHANGED -> Color.Gray
            },
            modifier = Modifier.width(20.dp)
        )
        Text(
            text = diffLine.content,
            style = MaterialTheme.typography.bodySmall
        )
    }
}