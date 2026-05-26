import SwiftUI
import Charts

// MARK: - P40: Finance Dashboard Page
struct DashboardPage: View {
    @StateObject private var viewModel = DashboardViewModel()
    @State private var selectedStock: Stock?
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Portfolio Summary Card
                    portfolioSummaryCard
                    
                    // Asset Allocation
                    assetAllocationSection
                    
                    // Watchlist / Stock List
                    watchlistSection
                }
                .padding()
            }
            .navigationTitle("Finance")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: { Task { await viewModel.loadData() } }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .sheet(item: $selectedStock) { stock in
                NavigationStack {
                    StockDetailPage(stock: stock)
                }
            }
            .task {
                await viewModel.loadData()
            }
        }
    }
    
    // MARK: - Portfolio Summary Card
    private var portfolioSummaryCard: some View {
        VStack(spacing: 16) {
            VStack(spacing: 4) {
                Text("Total Assets")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(formatCurrency(viewModel.portfolio.totalValue))
                    .font(.system(size: 36, weight: .bold))
                
                HStack(spacing: 8) {
                    Image(systemName: viewModel.portfolio.changePercent >= 0 ? "arrow.up.right" : "arrow.down.right")
                    Text("\(viewModel.portfolio.changePercent >= 0 ? "+" : "")\(String(format: "%.2f", viewModel.portfolio.changePercent))%")
                    Text("(\(formatCurrency(viewModel.portfolio.changeAmount)))")
                        .foregroundColor(.secondary)
                }
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(viewModel.portfolio.changePercent >= 0 ? .green : .red)
            }
            
            Divider()
            
            // Mini K-Line Chart
            if let firstStock = viewModel.stocks.first, let history = firstStock.history, !history.isEmpty {
                stockMiniChart(stock: firstStock)
                    .frame(height: 120)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
    }
    
    // MARK: - Stock Mini Chart
    private func stockMiniChart(stock: Stock) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(stock.symbol)
                    .font(.headline)
                Text(stock.name)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                VStack(alignment: .trailing) {
                    Text(formatCurrency(stock.currentPrice))
                        .font(.headline)
                    Text("\(stock.changePercent >= 0 ? "+" : "")\(String(format: "%.2f", stock.changePercent))%")
                        .font(.caption)
                        .foregroundColor(stock.changePercent >= 0 ? .green : .red)
                }
            }
            
            Chart(stock.history ?? []) { point in
                LineMark(
                    x: .value("Time", point.timestamp),
                    y: .value("Price", point.close)
                )
                .foregroundStyle(stock.changePercent >= 0 ? Color.green : Color.red)
                
                AreaMark(
                    x: .value("Time", point.timestamp),
                    y: .value("Price", point.close)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [(stock.changePercent >= 0 ? Color.green : Color.red).opacity(0.3), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            }
            .chartXAxis(.hidden)
            .chartYAxis(.hidden)
        }
    }
    
    // MARK: - Asset Allocation Section
    private var assetAllocationSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Asset Allocation")
                .font(.headline)
            
            HStack(spacing: 20) {
                // Pie Chart
                Chart(viewModel.portfolio.assets) { asset in
                    SectorMark(
                        angle: .value("Value", asset.value),
                        innerRadius: .ratio(0.5),
                        angularInset: 2
                    )
                    .foregroundStyle(by: .value("Type", asset.type.rawValue))
                    .cornerRadius(4)
                }
                .frame(width: 120, height: 120)
                .chartLegend(.hidden)
                
                // Legend
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(viewModel.portfolio.assets.prefix(5)) { asset in
                        HStack(spacing: 8) {
                            Circle()
                                .fill(colorForAssetType(asset.type))
                                .frame(width: 8, height: 8)
                            Text(asset.name)
                                .font(.caption)
                            Spacer()
                            Text("\(String(format: "%.1f", asset.value / viewModel.portfolio.totalValue * 100))%")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }
    
    // MARK: - Watchlist Section
    private var watchlistSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Watchlist")
                    .font(.headline)
                Spacer()
                NavigationLink(destination: Text("View All Stocks")) {
                    Text("See All")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            
            ForEach(viewModel.stocks.prefix(5)) { stock in
                Button(action: { selectedStock = stock }) {
                    StockRowView(stock: stock)
                }
                .buttonStyle(.plain)
            }
        }
    }
    
    // MARK: - Helpers
    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        return formatter.string(from: NSNumber(value: value)) ?? "$0.00"
    }
    
    private func colorForAssetType(_ type: AssetType) -> Color {
        switch type {
        case .stock: return .blue
        case .fund: return .green
        case .bond: return .orange
        case .cash: return .purple
        case .crypto: return .yellow
        }
    }
}

// MARK: - Stock Row View
struct StockRowView: View {
    let stock: Stock
    
    var body: some View {
        HStack(spacing: 12) {
            // Symbol Badge
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 50, height: 50)
                Text(stock.symbol.prefix(2))
                    .font(.headline)
                    .foregroundColor(.blue)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(stock.symbol)
                    .font(.headline)
                Text(stock.name)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "$%.2f", stock.currentPrice))
                    .font(.headline)
                HStack(spacing: 2) {
                    Image(systemName: stock.changePercent >= 0 ? "arrow.up.right" : "arrow.down.right")
                        .font(.caption2)
                    Text("\(String(format: "%.2f", stock.changePercent))%")
                        .font(.caption)
                }
                .foregroundColor(stock.changePercent >= 0 ? .green : .red)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}

// MARK: - ViewModel
@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var portfolio = Portfolio.mock
    @Published var stocks: [Stock] = []
    @Published var isLoading = false
    @Published var error: String?
    
    func loadData() async {
        isLoading = true
        error = nil
        
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        portfolio = Portfolio.mock
        stocks = Stock.mockStocks
        isLoading = false
    }
}

// MARK: - Mock Data
extension Portfolio {
    static let mock = Portfolio(
        totalValue: 156782.45,
        changeAmount: 2341.23,
        changePercent: 1.52,
        assets: [
            Asset(id: "a1", type: .stock, name: "AAPL", symbol: "AAPL", amount: 50, value: 8750.00, changePercent: 1.2),
            Asset(id: "a2", type: .stock, name: "GOOGL", symbol: "GOOGL", amount: 30, value: 4200.00, changePercent: -0.5),
            Asset(id: "a3", type: .fund, name: "Index Fund", symbol: nil, amount: 100, value: 25000.00, changePercent: 0.8),
            Asset(id: "a4", type: .bond, name: "Treasury", symbol: nil, amount: 10, value: 10000.00, changePercent: 0.2),
            Asset(id: "a5", type: .cash, name: "Savings", symbol: nil, amount: 1, value: 50000.00, changePercent: 0),
            Asset(id: "a6", type: .crypto, name: "BTC", symbol: "BTC", amount: 0.5, value: 48332.45, changePercent: 3.5)
        ]
    )
}

extension Stock {
    static let mockStocks: [Stock] = [
        Stock(
            id: "s1",
            symbol: "AAPL",
            name: "Apple Inc.",
            currentPrice: 175.50,
            changePercent: 1.25,
            changeAmount: 2.17,
            volume: 52_340_000,
            marketCap: 2_800_000_000_000,
            high52Week: 198.23,
            low52Week: 124.17,
            history: StockDataPoint.mockHistory
        ),
        Stock(
            id: "s2",
            symbol: "GOOGL",
            name: "Alphabet Inc.",
            currentPrice: 140.25,
            changePercent: -0.85,
            changeAmount: -1.20,
            volume: 28_450_000,
            marketCap: 1_750_000_000_000,
            high52Week: 153.78,
            low52Week: 102.21,
            history: StockDataPoint.mockHistory
        ),
        Stock(
            id: "s3",
            symbol: "TSLA",
            name: "Tesla Inc.",
            currentPrice: 242.80,
            changePercent: 2.45,
            changeAmount: 5.80,
            volume: 98_230_000,
            marketCap: 770_000_000_000,
            high52Week: 299.29,
            low52Week: 152.37,
            history: StockDataPoint.mockHistory
        ),
        Stock(
            id: "s4",
            symbol: "MSFT",
            name: "Microsoft Corp.",
            currentPrice: 378.90,
            changePercent: 0.95,
            changeAmount: 3.56,
            volume: 22_100_000,
            marketCap: 2_820_000_000_000,
            high52Week: 384.30,
            low52Week: 275.37,
            history: StockDataPoint.mockHistory
        ),
        Stock(
            id: "s5",
            symbol: "AMZN",
            name: "Amazon.com Inc.",
            currentPrice: 178.25,
            changePercent: 1.10,
            changeAmount: 1.94,
            volume: 45_600_000,
            marketCap: 1_850_000_000_000,
            high52Week: 189.77,
            low52Week: 118.35,
            history: StockDataPoint.mockHistory
        )
    ]
}

extension StockDataPoint {
    static let mockHistory: [StockDataPoint] = {
        let baseTime = Int(Date().timeIntervalSince1970) - 3600 * 24 * 30
        let basePrice = 170.0
        return (0..<30).map { i in
            let timestamp = baseTime + i * 3600 * 24
            let variance = Double.random(in: -5...5)
            let close = basePrice + variance + Double(i) * 0.2
            return StockDataPoint(
                timestamp: timestamp,
                open: close - 0.5,
                high: close + 1.5,
                low: close - 1.0,
                close: close,
                volume: Int.random(in: 30_000_000...60_000_000)
            )
        }
    }()
}

#Preview {
    DashboardPage()
}