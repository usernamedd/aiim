package com.aiim.app.presentation.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.aiim.app.data.local.TokenStorage
import com.aiim.app.data.repository.AuthRepositoryImpl
import com.aiim.app.domain.usecase.LoginUseCase

class LoginViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LoginViewModel::class.java)) {
            val tokenStorage = TokenStorage(context.applicationContext)
            val authRepository = AuthRepositoryImpl(context.applicationContext, tokenStorage)
            return LoginViewModel(LoginUseCase(authRepository)) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}