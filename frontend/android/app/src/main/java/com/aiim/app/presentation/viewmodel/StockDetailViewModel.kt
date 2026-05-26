package com.aiim.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class KLineData(
    val date: String,
    val open: Double,
    val high: Double,
    val low: Double,
    val close: Double,
    val volume: Long
)

data class StockDetailUiState(
    val symbol: String = "",
    val name: String = "",
    val currentPrice: Double = 0.0,
    val change: Double = 0.0,
    val changePercent: Double = 0.0,
    val open: Double = 0.0,
    val high: Double = 0.0,
    val low: Double = 0.0,
    val volume: Long = 0,
    val marketCap: String = "",
    val pe: Double = 0.0,
    val holdings: Int = 0,
    val cost: Double = 0.0,
    val marketValue: Double = 0.0,
    val totalPL: Double = 0.0,
    val totalPLPercent: Double = 0.0,
    val klineData: List<KLineData> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class StockDetailViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(StockDetailUiState())
    val uiState: StateFlow<StockDetailUiState> = _uiState.asStateFlow()

    fun loadStock(symbol: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, symbol = symbol)

            // Mock data based on symbol
            val (name, price, change, changePercent) = when (symbol) {
                "600519" -> listOf("贵州茅台", 1856.00, 23.50, 1.28)
                "00700" -> listOf("腾讯控股", 380.50, -1.22, -0.32)
                "AAPL" -> listOf("苹果公司", 189.30, 2.15, 1.15)
                "GOOGL" -> listOf("谷歌", 141.80, -0.95, -0.67)
                else -> listOf("未知股票", 100.00, 0.0, 0.0)
            }

            val holdings = 100
            val cost = 1750.0
            val marketValue = price * holdings
            val totalPL = (price - cost) * holdings
            val totalPLPercent = ((price - cost) / cost) * 100

            // Generate mock K-line data
            val klineData = generateKLineData(30)

            _uiState.value = StockDetailUiState(
                symbol = symbol,
                name = name as String,
                currentPrice = price as Double,
                change = change as Double,
                changePercent = changePercent as Double,
                open = price as Double - 5.0,
                high = price as Double + 10.0,
                low = price as Double - 8.0,
                volume = 125600000,
                marketCap = "2.35万亿",
                pe = 42.5,
                holdings = holdings,
                cost = cost,
                marketValue = marketValue,
                totalPL = totalPL,
                totalPLPercent = totalPLPercent,
                klineData = klineData,
                isLoading = false
            )
        }
    }

    private fun generateKLineData(days: Int): List<KLineData> {
        val data = mutableListOf<KLineData>()
        var basePrice = 1800.0
        val random = java.util.Random(42)

        for (i in days downTo 1) {
            val date = "2026-05-${i.toString().padStart(2, '0')}"
            val change = (random.nextDouble() - 0.5) * 30
            val open = basePrice
            val close = basePrice + change
            val high = maxOf(open, close) + random.nextDouble() * 5
            val low = minOf(open, close) - random.nextDouble() * 5
            val volume = (100000000L + random.nextLong(50000000))

            data.add(KLineData(date, open, high, low, close, volume))
            basePrice = close
        }

        return data
    }
}