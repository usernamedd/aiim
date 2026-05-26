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
}