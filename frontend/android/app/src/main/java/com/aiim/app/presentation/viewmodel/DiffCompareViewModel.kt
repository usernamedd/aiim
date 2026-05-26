package com.aiim.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class DiffViewMode {
    SPLIT,
    UNIFIED
}

data class DiffLine(
    val lineNumber: Int,
    val content: String,
    val type: DiffLineType // ADDED, REMOVED, UNCHANGED
)

enum class DiffLineType {
    ADDED,
    REMOVED,
    UNCHANGED
}

data class DiffFile(
    val name: String,
    val oldContent: List<String>,
    val newContent: List<String>,
    val diffLines: List<DiffLine>
)

data class DiffCompareState(
    val viewMode: DiffViewMode = DiffViewMode.SPLIT,
    val files: List<DiffFile> = emptyList(),
    val selectedFile: DiffFile? = null,
    val isLoading: Boolean = false
)

class DiffCompareViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(DiffCompareState())
    val uiState: StateFlow<DiffCompareState> = _uiState.asStateFlow()

    init {
        loadMockDiff()
    }

    private fun loadMockDiff() {
        val oldContent = listOf(
            "package com.example",
            "",
            "fun main() {",
            "    val x = 10",
            "    println(x)",
            "}"
        )
        val newContent = listOf(
            "package com.example",
            "",
            "fun main() {",
            "    val x = 20",
            "    println(x)",
            "    println(\"done\")",
            "}"
        )

        val diffLines = mutableListOf<DiffLine>()
        oldContent.forEachIndexed { index, line ->
            diffLines.add(DiffLine(index + 1, line, DiffLineType.UNCHANGED))
        }
        // Add some changed/added lines
        diffLines.add(DiffLine(oldContent.size + 1, "    // Added line", DiffLineType.ADDED))
        diffLines.add(DiffLine(oldContent.size + 2, "}", DiffLineType.UNCHANGED))

        val diffFile = DiffFile(
            name = "Main.kt",
            oldContent = oldContent,
            newContent = newContent,
            diffLines = diffLines
        )

        _uiState.value = DiffCompareState(
            files = listOf(diffFile),
            selectedFile = diffFile
        )
    }

    fun toggleViewMode() {
        val current = _uiState.value.viewMode
        _uiState.value = _uiState.value.copy(
            viewMode = if (current == DiffViewMode.SPLIT) DiffViewMode.UNIFIED else DiffViewMode.SPLIT
        )
    }

    fun selectFile(file: DiffFile) {
        _uiState.value = _uiState.value.copy(selectedFile = file)
    }
}