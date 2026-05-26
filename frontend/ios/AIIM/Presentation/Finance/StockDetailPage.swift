import SwiftUI
import Charts

// MARK: - P41: Stock Detail Page
struct StockDetailPage: View {
    let stock: Stock
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTimeRange: TimeRange = .month
    @State private var isInWatchlist = true
    
    enum TimeRange: String, CaseIterable {
        case day = "1D"
        case week = "1W"
        case month = "1M"
        case threeMonths = "3M"
        case year = "1Y"
        case all = "ALL"
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Price Header
                priceHeaderSection
                
                // K-Line Chart
                klineChartSection
                
                // Time Range Selector
                timeRangeSelector
                
                // Stock Details
                stockDetailsSection
                
                // Action Buttons
                actionButtonsSection
            }
            .padding()
        }
        .navigationTitle(stock.symbol)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { isInWatchlist.toggle() }) {
                    Image(systemName: isInWatchlist ? "star.fill" : "star")
                        .foregroundColor(isInWatchlist ? .yellow : .gray)
                }
            }
        }
    }
    
    // MARK: - Price Header Section
    private var priceHeaderSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(stock.name)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack(alignment: .lastTextBaseline, spacing: 12) {
                Text(formatCurrency(stock.currentPrice))
                    .font(.system(size: 36, weight: .bold))
                
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Image(systemName: stock.changePercent >= 0 ? "arrow.up.right" : "arrow.down.right")
                        Text("\(stock.changePercent >= 0 ? "+" : "")\(String(format: "%.2f", stock.changePercent))%")
                    }
                    .font(.headline)
                    .foregroundColor(stock.changePercent >= 0 ? .green : .red)
                    
                    Text("\(stock.changePercent >= 0 ? "+" : "")\(formatCurrency(stock.changeAmount))")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                Label("Vol: \(formatVolume(stock.volume))", systemImage: "chart.bar.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Label("Mkt Cap: \(formatMarketCap(stock.marketCap))", systemImage: "building.columns.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - K-Line Chart Section
    private var klineChartSection: some View {
        VStack(spacing: 8) {
            if let history = stock.history, !history.isEmpty {
                Chart {
                    ForEach(history) { point in
                        // Candlestick chart using bar marks
                        RectangleMark(
                            x: .value("Time", point.timestamp),
                            yStart: .value("Open", point.open),
                            yEnd: .value("Close", point.close),
                            width: 8
                        )
                        .foregroundStyle(point.close >= point.open ? Color.green : Color.red)
                        
                        // High/Low wicks
                        RuleMark(
                            x: .value("Time", point.timestamp),
                            yStart: .value("Low", point.low),
                            yEnd: .value("High", point.high)
                        )
                        .foregroundStyle(point.close >= point.open ? Color.green : Color.red)
                        .lineStyle(StrokeStyle(lineWidth: 1))
                    }
                }
                .chartXAxis {
                    AxisMarks(values: .automatic(desiredCount: 5)) { value in
                        if let timestamp = value.as(Int.self) {
                            AxisValueLabel {
                                Text(formatDate(timestamp))
                                    .font(.caption2)
                            }
                        }
                        AxisGridLine()
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .trailing, values: .automatic(desiredCount: 5)) { value in
                        if let price = value.as(Double.self) {
                            AxisValueLabel {
                                Text("$\(String(format: "%.0f", price))")
                                    .font(.caption2)
                            }
                        }
                        AxisGridLine()
                    }
                }
                .frame(height: 250)
                .padding(.horizontal, 8)
            } else {
                ContentUnavailableView(
                    "No Chart Data",
                    systemImage: "chart.line.uptrend.xyaxis",
                    description: Text("Historical data not available")
                )
                .frame(height: 250)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 4)
    }
    
    // MARK: - Time Range Selector
    private var timeRangeSelector: some View {
        HStack(spacing: 0) {
            ForEach(TimeRange.allCases, id: \.self) { range in
                Button(action: { selectedTimeRange = range }) {
                    Text(range.rawValue)
                        .font(.subheadline)
                        .fontWeight(selectedTimeRange == range ? .semibold : .regular)
                        .foregroundColor(selectedTimeRange == range ? .white : .primary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            selectedTimeRange == range ? Color.blue : Color.clear,
                            in: RoundedRectangle(cornerRadius: 8)
                        )
                }
            }
        }
        .padding(4)
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    // MARK: - Stock Details Section
    private var stockDetailsSection: some View {
        VStack(spacing: 16) {
            Text("Stock Information")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 0) {
                detailRow(title: "Open", value: formatCurrency(stock.history?.last?.open ?? stock.currentPrice - stock.changeAmount))
                Divider()
                detailRow(title: "High", value: formatCurrency(stock.high52Week))
                Divider()
                detailRow(title: "Low", value: formatCurrency(stock.low52Week))
                Divider()
                detailRow(title: "52W High", value: formatCurrency(stock.high52Week))
                Divider()
                detailRow(title: "52W Low", value: formatCurrency(stock.low52Week))
                Divider()
                detailRow(title: "Volume", value: formatVolume(stock.volume))
                Divider()
                detailRow(title: "Market Cap", value: formatMarketCap(stock.marketCap))
            }
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }
    
    private func detailRow(title: String, value: String) -> some View {
        HStack {
            Text(title)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
        .padding()
    }
    
    // MARK: - Action Buttons Section
    private var actionButtonsSection: some View {
        HStack(spacing: 16) {
            Button(action: {}) {
                Label("Buy", systemImage: "arrow.up.circle.fill")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .cornerRadius(12)
            }
            
            Button(action: {}) {
                Label("Sell", systemImage: "arrow.down.circle.fill")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .cornerRadius(12)
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
    
    private func formatVolume(_ volume: Int) -> String {
        if volume >= 1_000_000_000 {
            return String(format: "%.2fB", Double(volume) / 1_000_000_000)
        } else if volume >= 1_000_000 {
            return String(format: "%.2fM", Double(volume) / 1_000_000)
        } else if volume >= 1_000 {
            return String(format: "%.2fK", Double(volume) / 1_000)
        }
        return "\(volume)"
    }
    
    private func formatMarketCap(_ marketCap: Double) -> String {
        if marketCap >= 1_000_000_000_000 {
            return String(format: "$%.2fT", marketCap / 1_000_000_000_000)
        } else if marketCap >= 1_000_000_000 {
            return String(format: "$%.2fB", marketCap / 1_000_000_000)
        } else if marketCap >= 1_000_000 {
            return String(format: "$%.2fM", marketCap / 1_000_000)
        }
        return String(format: "$%.0f", marketCap)
    }
    
    private func formatDate(_ timestamp: Int) -> String {
        let date = Date(timeIntervalSince1970: TimeInterval(timestamp))
        let formatter = DateFormatter()
        formatter.dateFormat = "MM/dd"
        return formatter.string(from: date)
    }
}

#Preview {
    NavigationStack {
        StockDetailPage(stock: Stock.mockStocks[0])
    }
}