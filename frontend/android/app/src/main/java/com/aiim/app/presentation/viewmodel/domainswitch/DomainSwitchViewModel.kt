package com.aiim.app.presentation.viewmodel.domainswitch

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class DomainSwitchUiState(
    val domains: List<String> = listOf(
        "https://api.aiim.example.com",
        "https://api-staging.aiim.example.com",
        "https://api-dev.aiim.example.com"
    ),
    val selectedDomain: String = "https://api.aiim.example.com",
    val isLoading: Boolean = false
)

class DomainSwitchViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(DomainSwitchUiState())
    val uiState: StateFlow<DomainSwitchUiState> = _uiState.asStateFlow()

    fun selectDomain(domain: String) {
        _uiState.value = _uiState.value.copy(selectedDomain = domain)
    }

    fun addDomain(domain: String) {
        val currentDomains = _uiState.value.domains.toMutableList()
        if (!currentDomains.contains(domain)) {
            currentDomains.add(domain)
            _uiState.value = _uiState.value.copy(domains = currentDomains)
        }
    }

    fun deleteDomain(domain: String) {
        val currentDomains = _uiState.value.domains.toMutableList()
        currentDomains.remove(domain)
        val newSelected = if (_uiState.value.selectedDomain == domain) {
            currentDomains.firstOrNull() ?: ""
        } else {
            _uiState.value.selectedDomain
        }
        _uiState.value = _uiState.value.copy(
            domains = currentDomains,
            selectedDomain = newSelected
        )
    }
}

class DomainSwitchViewModelFactory : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        return DomainSwitchViewModel() as T
    }
}