package com.aiim.app.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.aiim.app.presentation.ui.aiassistant.AIAssistantScreen
import com.aiim.app.presentation.ui.chat.PrivateChatScreen
import com.aiim.app.presentation.ui.contacts.ContactsScreen
import com.aiim.app.presentation.ui.debugconsole.DebugConsoleScreen
import com.aiim.app.presentation.ui.diffcompare.DiffCompareScreen
import com.aiim.app.presentation.ui.filebrowser.FileBrowserScreen
import com.aiim.app.presentation.ui.forgotpassword.ForgotPasswordScreen
import com.aiim.app.presentation.ui.home.HomeScreen
import com.aiim.app.presentation.ui.login.LoginScreen
import com.aiim.app.presentation.ui.register.RegisterScreen
import com.aiim.app.presentation.ui.settings.SettingsScreen

@Composable
fun AIIMNavGraph(
    navController: NavHostController
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        // P01: Login
        composable(route = Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                },
                onNavigateToForgotPassword = {
                    navController.navigate(Screen.ForgotPassword.route)
                }
            )
        }

        // P02: Register
        composable(route = Screen.Register.route) {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                },
                onBackToLogin = {
                    navController.popBackStack()
                }
            )
        }

        // P03: Forgot Password
        composable(route = Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBackToLogin = {
                    navController.popBackStack()
                }
            )
        }

        // P10: Home
        composable(route = Screen.Home.route) {
            HomeScreen(
                onNavigateToChat = { chatId ->
                    navController.navigate(Screen.PrivateChat.createRoute(chatId))
                },
                onNavigateToContacts = {
                    navController.navigate(Screen.Contacts.route)
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onNavigateToFileBrowser = {
                    navController.navigate(Screen.FileBrowser.route)
                },
                onNavigateToDebugConsole = {
                    navController.navigate(Screen.DebugConsole.route)
                },
                onNavigateToDiffCompare = {
                    navController.navigate(Screen.DiffCompare.route)
                },
                onNavigateToAIAssistant = {
                    navController.navigate(Screen.AIAssistant.route)
                }
            )
        }

        // P20: Private Chat
        composable(
            route = Screen.PrivateChat.route,
            arguments = listOf(navArgument("chatId") { type = androidx.navigation.NavType.StringType })
        ) { backStackEntry ->
            val chatId = backStackEntry.arguments?.getString("chatId") ?: ""
            PrivateChatScreen(
                chatId = chatId,
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        // P22: Contacts
        composable(route = Screen.Contacts.route) {
            ContactsScreen(
                onBack = {
                    navController.popBackStack()
                },
                onStartChat = { userId ->
                    navController.navigate(Screen.PrivateChat.createRoute(userId))
                }
            )
        }

        // P50: Settings
        composable(route = Screen.Settings.route) {
            SettingsScreen(
                onBack = {
                    navController.popBackStack()
                },
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // P30: File Browser
        composable(route = Screen.FileBrowser.route) {
            FileBrowserScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        // P31: Debug Console
        composable(route = Screen.DebugConsole.route) {
            DebugConsoleScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        // P32: Diff Compare
        composable(route = Screen.DiffCompare.route) {
            DiffCompareScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        // P33: AI Assistant
        composable(route = Screen.AIAssistant.route) {
            AIAssistantScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}