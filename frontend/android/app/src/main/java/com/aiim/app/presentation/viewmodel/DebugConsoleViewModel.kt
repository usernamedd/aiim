package com.aiim.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class Breakpoint(
    val id: String,
    val fileName: String,
    val lineNumber: Int,
    val isEnabled: Boolean = true
)

data class Variable(
    val name: String,
    val value: String,
    val type: String
)

data class StackFrame(
    val methodName: String,
    val fileName: String,
    val lineNumber: Int
)

data class DebugState(
    val isDebugging: Boolean = false,
    val isPaused: Boolean = false,
    val breakpoints: List<Breakpoint> = emptyList(),
    val currentLine: Int? = null,
    val variables: List<Variable> = emptyList(),
    val callStack: List<StackFrame> = emptyList(),
    val output: List<String> = emptyList()
)

class DebugConsoleViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(DebugState())
    val uiState: StateFlow<DebugState> = _uiState.asStateFlow()

    init {
        loadMockDebugState()
    }

    private fun loadMockDebugState() {
        _uiState.value = DebugState(
            isDebugging = true,
            isPaused = true,
            currentLine = 15,
            breakpoints = listOf(
                Breakpoint("bp1", "Main.kt", 10),
                Breakpoint("bp2", "Main.kt", 15),
                Breakpoint("bp3", "App.kt", 25)
            ),
            variables = listOf(
                Variable("count", "5", "Int"),
                Variable("name", "\"John\"", "String"),
                Variable("items", "[1, 2, 3]", "List<Int>")
            ),
            callStack = listOf(
                StackFrame("onClick", "Main.kt", 15),
                StackFrame("handleEvent", "Main.kt", 8),
                StackFrame("main", "Main.kt", 3)
            ),
            output = listOf(
                "[DEBUG] Application started",
                "[INFO] Loading configuration...",
                "[DEBUG] Breakpoint hit at line 15"
            )
        )
    }

    fun toggleBreakpoint(breakpoint: Breakpoint) {
        val current = _uiState.value.breakpoints.toMutableList()
        val index = current.indexOfFirst { it.id == breakpoint.id }
        if (index != -1) {
            current[index] = current[index].copy(isEnabled = !current[index].isEnabled)
            _uiState.value = _uiState.value.copy(breakpoints = current)
        }
    }

    fun resume() {
        _uiState.value = _uiState.value.copy(isPaused = false, currentLine = null)
        appendOutput("[INFO] Resumed execution")
    }

    fun stepOver() {
        val current = _uiState.value.currentLine ?: 15
        _uiState.value = _uiState.value.copy(currentLine = current + 1)
        appendOutput("[DEBUG] Stepped to line ${current + 1}")
    }

    private fun appendOutput(message: String) {
        _uiState.value = _uiState.value.copy(output = _uiState.value.output + message)
    }
}