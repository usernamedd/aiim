package com.aiim.app.presentation.navigation

sealed class Screen(val route: String) {
    // Auth pages
    data object Login : Screen("login")
    data object Register : Screen("register")
    data object ForgotPassword : Screen("forgot_password")

    // Main pages
    data object Home : Screen("home")
    data object PrivateChat : Screen("private_chat/{chatId}") {
        fun createRoute(chatId: String) = "private_chat/$chatId"
    }
    data object Contacts : Screen("contacts")
    data object Settings : Screen("settings")

    // Software Engineering pages
    data object FileBrowser : Screen("file_browser")
    data object DebugConsole : Screen("debug_console")
    data object DiffCompare : Screen("diff_compare")
    data object AIAssistant : Screen("ai_assistant")
}