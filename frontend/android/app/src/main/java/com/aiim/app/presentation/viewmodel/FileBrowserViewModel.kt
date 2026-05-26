package com.aiim.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class FileNode(
    val name: String,
    val path: String,
    val isDirectory: Boolean,
    val children: List<FileNode> = emptyList()
)

data class FileBrowserState(
    val currentPath: String = "/",
    val files: List<FileNode> = emptyList(),
    val selectedFile: FileNode? = null,
    val fileContent: String = "",
    val isLoading: Boolean = false
)

class FileBrowserViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(FileBrowserState())
    val uiState: StateFlow<FileBrowserState> = _uiState.asStateFlow()

    init {
        loadMockFiles()
    }

    private fun loadMockFiles() {
        val mockFiles = listOf(
            FileNode(
                name = "src",
                path = "/src",
                isDirectory = true,
                children = listOf(
                    FileNode(
                        name = "main",
                        path = "/src/main",
                        isDirectory = true,
                        children = listOf(
                            FileNode(name = "Main.kt", path = "/src/main/Main.kt", isDirectory = false),
                            FileNode(name = "App.kt", path = "/src/main/App.kt", isDirectory = false)
                        )
                    ),
                    FileNode(
                        name = "test",
                        path = "/src/test",
                        isDirectory = true,
                        children = listOf(
                            FileNode(name = "Test.kt", path = "/src/test/Test.kt", isDirectory = false)
                        )
                    )
                )
            ),
            FileNode(
                name = "build.gradle.kts",
                path = "/build.gradle.kts",
                isDirectory = false
            ),
            FileNode(
                name = "README.md",
                path = "/README.md",
                isDirectory = false
            )
        )
        _uiState.value = _uiState.value.copy(files = mockFiles)
    }

    fun selectFile(file: FileNode) {
        if (!file.isDirectory) {
            val mockContent = "// Content of ${file.name}\nfun main() {\n    println(\"Hello from ${file.name}\")\n}"
            _uiState.value = _uiState.value.copy(selectedFile = file, fileContent = mockContent)
        }
    }

    fun navigateToDirectory(dir: FileNode) {
        if (dir.isDirectory) {
            _uiState.value = _uiState.value.copy(currentPath = dir.path, files = dir.children)
        }
    }

    fun goBack() {
        val current = _uiState.value.currentPath
        if (current != "/") {
            val parentPath = current.substringBeforeLast("/", "")
            // Find parent directory's children
            _uiState.value = _uiState.value.copy(currentPath = if (parentPath.isEmpty()) "/" else parentPath)
        }
    }
}