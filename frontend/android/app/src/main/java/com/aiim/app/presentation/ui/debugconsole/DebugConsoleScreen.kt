package com.aiim.app.presentation.ui.debugconsole

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aiim.app.presentation.viewmodel.Breakpoint
import com.aiim.app.presentation.viewmodel.DebugConsoleViewModel
import com.aiim.app.presentation.viewmodel.StackFrame
import com.aiim.app.presentation.viewmodel.Variable

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DebugConsoleScreen(
    onBack: () -> Unit,
    viewModel: DebugConsoleViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Debug Console") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (uiState.isPaused) {
                        IconButton(onClick = { viewModel.resume() }) {
                            Icon(Icons.Default.PlayArrow, contentDescription = "Resume")
                        }
                        IconButton(onClick = { viewModel.stepOver() }) {
                            Icon(Icons.Default.SkipNext, contentDescription = "Step Over")
                        }
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
            // Status bar
            Surface(
                color = if (uiState.isPaused) Color.Yellow.copy(alpha = 0.3f) else Color.Green.copy(alpha = 0.3f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (uiState.isPaused) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = null
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (uiState.isPaused) "Paused at line ${uiState.currentLine}" else "Running",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            // Debug content
            Row(
                modifier = Modifier.weight(1f)
            ) {
                // Left: Breakpoints & Variables
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    // Breakpoints section
                    Text(
                        text = "Breakpoints",
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.padding(8.dp)
                    )
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp)
                    ) {
                        items(uiState.breakpoints) { bp ->
                            BreakpointItem(
                                breakpoint = bp,
                                onToggle = { viewModel.toggleBreakpoint(bp) }
                            )
                        }
                    }

                    HorizontalDivider()

                    // Variables section
                    Text(
                        text = "Variables",
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.padding(8.dp)
                    )
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp)
                    ) {
                        items(uiState.variables) { variable ->
                            VariableItem(variable = variable)
                        }
                    }
                }

                VerticalDivider()

                // Right: Call Stack & Output
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    // Call Stack
                    Text(
                        text = "Call Stack",
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.padding(8.dp)
                    )
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp)
                    ) {
                        items(uiState.callStack) { frame ->
                            StackFrameItem(frame = frame)
                        }
                    }

                    HorizontalDivider()

                    // Output
                    Text(
                        text = "Output",
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.padding(8.dp)
                    )
                    val listState = rememberLazyListState()
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp)
                            .background(Color.Black.copy(alpha = 0.1f))
                    ) {
                        items(uiState.output) { line ->
                            Text(
                                text = line,
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BreakpointItem(
    breakpoint: Breakpoint,
    onToggle: () -> Unit
) {
    ListItem(
        headlineContent = { Text("${breakpoint.fileName}:${breakpoint.lineNumber}") },
        leadingContent = {
            Icon(
                imageVector = Icons.Default.Circle,
                contentDescription = null,
                tint = if (breakpoint.isEnabled) Color.Red else Color.Gray
            )
        },
        trailingContent = {
            Switch(
                checked = breakpoint.isEnabled,
                onCheckedChange = { onToggle() }
            )
        }
    )
}

@Composable
private fun VariableItem(variable: Variable) {
    ListItem(
        headlineContent = { Text(variable.name) },
        supportingContent = { Text(variable.type) },
        trailingContent = { Text(variable.value) }
    )
}

@Composable
private fun StackFrameItem(frame: StackFrame) {
    ListItem(
        headlineContent = { Text(frame.methodName) },
        supportingContent = { Text("${frame.fileName}:${frame.lineNumber}") }
    )
}