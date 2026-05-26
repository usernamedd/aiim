package com.aiim.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class Stock(
    val symbol: String,
    val name: String,
    val price: Double,
    val change: Double,
    val changePercent: Double,
    val holdings: Int,
    val cost: Double,
    val marketValue: Double
)

data class MarketIndex(
    val name: String,
    val code: String,
    val value: Double,
    val change: Double,
    val changePercent: Double
)

data class Transaction(
    val type: String,
    val name: String,
    val volume: Int,
    val price: Double,
    val amount: Double,
    val time: String
)

data class DashboardUiState(
    val totalValue: Double = 0.0,
    val totalCost: Double = 0.0,
    val totalPL: Double = 0.0,
    val totalPLPercent: Double = 0.0,
    val todayPL: Double = 0.0,
    val monthPL: Double = 0.0,
    val holdings: List<Stock> = emptyList(),
    val indices: List<MarketIndex> = emptyList(),
    val transactions: List<Transaction> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class DashboardViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val mockStocks = listOf(
                Stock("600519", "贵州茅台", 1856.00, 23.50, 1.28, 100, 1750.0, 185600.0),
                Stock("00700", "腾讯控股", 380.50, -1.22, -0.32, 200, 375.0, 76100.0),
                Stock("AAPL", "苹果公司", 189.30, 2.15, 1.15, 50, 175.0, 9465.0),
                Stock("GOOGL", "谷歌", 141.80, -0.95, -0.67, 30, 145.0, 4254.0)
            )

            val mockIndices = listOf(
                MarketIndex("上证指数", "000001", 3256.78, 15.32, 0.47),
                MarketIndex("深证成指", "399001", 10821.45, 56.23, 0.52),
                MarketIndex("创业板", "399006", 1856.32, -2.41, -0.13),
                MarketIndex("沪深300", "000300", 3892.76, 12.08, 0.31)
            )

            val mockTransactions = listOf(
                Transaction("buy", "贵州茅台", 100, 1850.0, 185000.0, "2026-05-24 10:30"),
                Transaction("sell", "腾讯控股", 200, 375.0, 75000.0, "2026-05-23 14:20"),
                Transaction("buy", "苹果公司", 50, 182.0, 9100.0, "2026-05-22 09:45")
            )

            val totalValue = mockStocks.sumOf { it.marketValue }
            val totalCost = mockStocks.sumOf { it.cost * it.holdings }
            val totalPL = totalValue - totalCost
            val totalPLPercent = (totalPL / totalCost) * 100
            val todayPL = mockStocks.sumOf { it.change * it.holdings }
            val monthPL = totalPL * 0.27

            _uiState.value = DashboardUiState(
                totalValue = totalValue,
                totalCost = totalCost,
                totalPL = totalPL,
                totalPLPercent = totalPLPercent,
                todayPL = todayPL,
                monthPL = monthPL,
                holdings = mockStocks,
                indices = mockIndices,
                transactions = mockTransactions,
                isLoading = false
            )
        }
    }

    fun refresh() {
        loadDashboard()
    }
}