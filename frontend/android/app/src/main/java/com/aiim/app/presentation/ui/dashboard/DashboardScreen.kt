package com.aiim.app.presentation.ui.dashboard

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.aiim.app.presentation.viewmodel.DashboardViewModel
import com.aiim.app.presentation.viewmodel.MarketIndex
import com.aiim.app.presentation.viewmodel.Stock
import com.aiim.app.presentation.viewmodel.Transaction

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onBack: () -> Unit,
    onStockClick: (String) -> Unit,
    viewModel: DashboardViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("投资仪表盘") },
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
                // Summary Cards
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        SummaryCard(
                            title = "总资产",
                            value = "¥${String.format("%,.2f", uiState.totalValue)}",
                            subtitle = formatPL(uiState.totalPL) + " (${String.format("%.2f", uiState.totalPLPercent)}%)",
                            positive = uiState.totalPL >= 0,
                            modifier = Modifier.weight(1f)
                        )
                        SummaryCard(
                            title = "今日盈亏",
                            value = formatPL(uiState.todayPL),
                            subtitle = String.format("%.2f%%", uiState.todayPL / uiState.totalValue * 100),
                            positive = uiState.todayPL >= 0,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        SummaryCard(
                            title = "本月收益",
                            value = formatPL(uiState.monthPL),
                            subtitle = "+3.75%",
                            positive = uiState.monthPL >= 0,
                            modifier = Modifier.weight(1f)
                        )
                        AssetAllocationCard(modifier = Modifier.weight(1f))
                    }
                }

                // Market Indices
                item {
                    MarketIndicesSection(indices = uiState.indices)
                }

                // Holdings
                item {
                    HoldingsSection(
                        holdings = uiState.holdings,
                        totalPL = uiState.totalPL,
                        onStockClick = onStockClick
                    )
                }

                // Recent Transactions
                item {
                    TransactionsSection(transactions = uiState.transactions)
                }
            }
        }
    }
}

@Composable
private fun SummaryCard(
    title: String,
    value: String,
    subtitle: String,
    positive: Boolean,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444)
            )
        }
    }
}

@Composable
private fun AssetAllocationCard(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Text(
                text = "资产配置",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                AssetItem(color = Color(0xFF3B82F6), label = "A股", value = "45%")
                AssetItem(color = Color(0xFF22C55E), label = "港股", value = "25%")
                AssetItem(color = Color(0xFFF59E0B), label = "美股", value = "20%")
                AssetItem(color = Color(0xFF8B5CF6), label = "基金", value = "10%")
            }
        }
    }
}

@Composable
private fun AssetItem(color: Color, label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(color, CircleShape)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = label, style = MaterialTheme.typography.bodySmall)
        Text(text = value, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun MarketIndicesSection(indices: List<MarketIndex>) {
    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "市场行情",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(indices) { index ->
                    IndexCard(index = index)
                }
            }
        }
    }
}

@Composable
private fun IndexCard(index: MarketIndex) {
    val positive = index.change >= 0
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = index.name, style = MaterialTheme.typography.bodySmall)
            Text(
                text = String.format("%.2f", index.value),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = if (positive) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                    contentDescription = null,
                    tint = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444),
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = String.format("%+.2f (%.2f%%)", index.change, index.changePercent),
                    style = MaterialTheme.typography.bodySmall,
                    color = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444)
                )
            }
        }
    }
}

@Composable
private fun HoldingsSection(
    holdings: List<Stock>,
    totalPL: Double,
    onStockClick: (String) -> Unit
) {
    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "我的持仓",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "总盈亏 ${formatPL(totalPL)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = if (totalPL >= 0) Color(0xFF22C55E) else Color(0xFFEF4444)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))

            holdings.forEach { stock ->
                StockItem(stock = stock, onClick = { onStockClick(stock.symbol) })
                if (stock != holdings.last()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                }
            }
        }
    }
}

@Composable
private fun StockItem(stock: Stock, onClick: () -> Unit) {
    val positive = stock.change >= 0
    val pl = (stock.price - stock.cost) * stock.holdings
    val plPercent = ((stock.price - stock.cost) / stock.cost) * 100

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = stock.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text(text = stock.symbol, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(text = "¥${String.format("%.2f", stock.price)}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text(
                text = "${if (positive) "▲" else "▼"} ${String.format("%.2f%%", stock.changePercent)}",
                style = MaterialTheme.typography.bodySmall,
                color = if (positive) Color(0xFF22C55E) else Color(0xFFEF4444)
            )
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(horizontalAlignment = Alignment.End) {
            Text(text = "${stock.holdings}股", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(text = "¥${String.format("%,.0f", stock.marketValue)}", style = MaterialTheme.typography.bodySmall)
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = formatPL(pl),
                style = MaterialTheme.typography.bodySmall,
                color = if (pl >= 0) Color(0xFF22C55E) else Color(0xFFEF4444)
            )
            Text(
                text = "${String.format("%.2f", plPercent)}%",
                style = MaterialTheme.typography.bodySmall,
                color = if (pl >= 0) Color(0xFF22C55E) else Color(0xFFEF4444)
            )
        }
    }
}

@Composable
private fun TransactionsSection(transactions: List<Transaction>) {
    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "近期交易",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))

            transactions.forEach { tx ->
                TransactionItem(transaction = tx)
                if (tx != transactions.last()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                }
            }
        }
    }
}

@Composable
private fun TransactionItem(transaction: Transaction) {
    val isBuy = transaction.type == "buy"
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(
                    if (isBuy) Color(0xFF22C55E).copy(alpha = 0.1f) else Color(0xFFEF4444).copy(alpha = 0.1f),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(text = if (isBuy) "🟢" else "🔴", style = MaterialTheme.typography.bodySmall)
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = transaction.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isBuy) "买入" else "卖出",
                    style = MaterialTheme.typography.bodySmall,
                    color = if (isBuy) Color(0xFF22C55E) else Color(0xFFEF4444)
                )
            }
            Text(
                text = "${transaction.volume} 股 @ ¥${transaction.price}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(text = "¥${String.format("%,.0f", transaction.amount)}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text(text = transaction.time, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private fun formatPL(value: Double): String {
    return if (value >= 0) {
        "+¥${String.format("%,.2f", value)}"
    } else {
        "-¥${String.format("%,.2f", kotlin.math.abs(value))}"
    }
}