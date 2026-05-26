package com.aiim.app.presentation.ui.stockdetail

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aiim.app.presentation.viewmodel.KLineData
import com.aiim.app.presentation.viewmodel.StockDetailUiState
import com.aiim.app.presentation.viewmodel.StockDetailViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StockDetailScreen(
    symbol: String,
    onBack: () -> Unit,
    viewModel: StockDetailViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(symbol) {
        viewModel.loadStock(symbol)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState.name.ifEmpty { symbol }) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Price Header
                item {
                    PriceHeader(uiState)
                }

                // K-Line Chart
                item {
                    KLineChartCard(klineData = uiState.klineData, positive = uiState.change >= 0)
                }

                // Stock Info
                item {
                    StockInfoCard(uiState)
                }

                // Holdings Info
                item {
                    HoldingsCard(uiState)
                }
            }
        }
    }
}

@Composable
private fun PriceHeader(uiState: StockDetailUiState) {
    val positive = uiState.change >= 0

    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = uiState.symbol,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "¥${String.format("%.2f", uiState.currentPrice)}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (positive) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                                contentDescription = null,
                                tint = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${if (positive) "+" else ""}${String.format("%.2f", uiState.change)}",
                                style = MaterialTheme.typography.bodyLarge,
                                color = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444)
                            )
                            Text(
                                text = " (${if (positive) "+" else ""}${String.format("%.2f", uiState.changePercent)}%)",
                                style = MaterialTheme.typography.bodyLarge,
                                color = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun KLineChartCard(klineData: List<KLineData>, positive: Boolean) {
    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "K线图",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            if (klineData.isNotEmpty()) {
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                ) {
                    val minPrice = klineData.minOf { it.low }
                    val maxPrice = klineData.maxOf { it.high }
                    val priceRange = maxPrice - minPrice

                    val candleWidth = size.width / klineData.size
                    val chartHeight = size.height - 40

                    klineData.forEachIndexed { index, data ->
                        val centerX = index * candleWidth + candleWidth / 2

                        // Calculate y positions
                        val openY = chartHeight - ((data.open - minPrice) / priceRange * chartHeight).toFloat()
                        val closeY = chartHeight - ((data.close - minPrice) / priceRange * chartHeight).toFloat()
                        val highY = chartHeight - ((data.high - minPrice) / priceRange * chartHeight).toFloat()
                        val lowY = chartHeight - ((data.low - minPrice) / priceRange * chartHeight).toFloat()

                        val color = if (data.close >= data.open) Color(0xFF22C55E) else Color(0xFFEF4444)

                        // Draw wick
                        drawLine(
                            color = color,
                            start = Offset(centerX, highY),
                            end = Offset(centerX, lowY),
                            strokeWidth = 1f
                        )

                        // Draw candle body
                        val bodyTop = minOf(openY, closeY)
                        val bodyBottom = maxOf(openY, closeY)
                        val bodyHeight = maxOf(bodyBottom - bodyTop, 1f)

                        drawRect(
                            color = color,
                            topLeft = Offset(centerX - candleWidth / 4, bodyTop),
                            size = androidx.compose.ui.geometry.Size(candleWidth / 2, bodyHeight)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "近30日K线",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun StockInfoCard(uiState: StockDetailUiState) {
    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "股票信息",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                InfoItem(label = "开盘", value = "¥${String.format("%.2f", uiState.open)}", modifier = Modifier.weight(1f))
                InfoItem(label = "最高", value = "¥${String.format("%.2f", uiState.high)}", modifier = Modifier.weight(1f))
                InfoItem(label = "最低", value = "¥${String.format("%.2f", uiState.low)}", modifier = Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth()) {
                InfoItem(label = "成交量", value = formatVolume(uiState.volume), modifier = Modifier.weight(1f))
                InfoItem(label = "市值", value = uiState.marketCap, modifier = Modifier.weight(1f))
                InfoItem(label = "市盈率", value = String.format("%.2f", uiState.pe), modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun InfoItem(label: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun HoldingsCard(uiState: StockDetailUiState) {
    val plPositive = uiState.totalPL >= 0

    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "我的持仓",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                InfoItem(label = "持仓", value = "${uiState.holdings} 股", modifier = Modifier.weight(1f))
                InfoItem(label = "成本价", value = "¥${String.format("%.2f", uiState.cost)}", modifier = Modifier.weight(1f))
                InfoItem(label = "市值", value = "¥${String.format("%,.2f", uiState.marketValue)}", modifier = Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(12.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "盈亏",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = if (plPositive) "+¥${String.format("%,.2f", uiState.totalPL)}" else "-¥${String.format("%,.2f", kotlin.math.abs(uiState.totalPL))}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (plPositive) Color(0xFF22C55E) else Color(0xFFEF4444)
                    )
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "收益率",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${if (plPositive) "+" else ""}${String.format("%.2f", uiState.totalPLPercent)}%",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (plPositive) Color(0xFF22C55E) else Color(0xFFEF4444)
                    )
                }
            }
        }
    }
}

private fun formatVolume(volume: Long): String {
    return when {
        volume >= 100000000 -> String.format("%.2f亿", volume / 100000000.0)
        volume >= 10000 -> String.format("%.2f万", volume / 10000.0)
        else -> volume.toString()
    }
}