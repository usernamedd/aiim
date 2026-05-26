// Page: P40 仪表盘页（金融研究切面）
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/C07-Button/Button'

// Mock 数据
const mockStocks = [
  { symbol: '600519', name: '贵州茅台', price: 1856.00, change: 23.50, changePercent: 1.28, holdings: 100, cost: 1750, marketValue: 185600 },
  { symbol: '00700', name: '腾讯控股', price: 380.50, change: -1.22, changePercent: -0.32, holdings: 200, cost: 375, marketValue: 76100 },
  { symbol: 'AAPL', name: '苹果公司', price: 189.30, change: 2.15, changePercent: 1.15, holdings: 50, cost: 175, marketValue: 9465 },
  { symbol: 'GOOGL', name: '谷歌', price: 141.80, change: -0.95, changePercent: -0.67, holdings: 30, cost: 145, marketValue: 4254 },
]

const mockIndices = [
  { name: '上证指数', code: '000001', value: 3256.78, change: 15.32, changePercent: 0.47 },
  { name: '深证成指', code: '399001', value: 10821.45, change: 56.23, changePercent: 0.52 },
  { name: '创业板', code: '399006', value: 1856.32, change: -2.41, changePercent: -0.13 },
  { name: '沪深300', code: '000300', value: 3892.76, change: 12.08, changePercent: 0.31 },
]

const mockTransactions = [
  { type: 'buy', name: '贵州茅台', volume: 100, price: 1850, amount: 185000, time: '2026-05-24 10:30' },
  { type: 'sell', name: '腾讯控股', volume: 200, price: 375, amount: 75000, time: '2026-05-23 14:20' },
  { type: 'buy', name: '苹果公司', volume: 50, price: 182, amount: 9100, time: '2026-05-22 09:45' },
]

// 迷你折线图 SVG 组件
function MiniLineChart({ data, positive }: { data: number[], positive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 60
  const height = 24
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  const color = positive ? '#22c55e' : '#ef4444'

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// 饼图 SVG 组件
function PieChart() {
  const data = [
    { label: 'A股', value: 45, color: '#3b82f6' },
    { label: '港股', value: 25, color: '#22c55e' },
    { label: '美股', value: 20, color: '#f59e0b' },
    { label: '基金', value: 10, color: '#8b5cf6' },
  ]
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let currentAngle = -90

  const paths = data.map((item) => {
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const radius = 40
    const cx = 50
    const cy = 50

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    return { path: d, color: item.color, label: item.label, value: item.value }
  })

  return (
    <div className="flex items-center gap-3">
      <svg width={100} height={100} viewBox="0 0 100 100">
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} />
        ))}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      <div className="flex flex-col gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="text-gray-400">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('2026-05-25')

  const totalValue = mockStocks.reduce((sum, s) => sum + s.marketValue, 0)
  const totalCost = mockStocks.reduce((sum, s) => sum + s.cost * s.holdings, 0)
  const totalPL = totalValue - totalCost
  const totalPLPercent = ((totalPL / totalCost) * 100).toFixed(2)
  const todayPL = mockStocks.reduce((sum, s) => sum + s.change * s.holdings, 0)
  const monthPL = totalPL * 0.27 // Mock

  const formatNumber = (n: number) => {
    return n >= 0 ? `+¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `-¥${Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercent = (n: number) => {
    return n >= 0 ? `+${n.toFixed(2)}%` : `${n.toFixed(2)}%`
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      {/* TopBar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">投资仪表盘</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-md flex items-center gap-1.5">
            <span>📅</span>
            <span>{selectedDate}</span>
          </button>
          <Button variant="ghost" size="sm">⟳</Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Value Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 mb-1">总资产</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ¥{totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-green-500">▲</span>
              <span className="text-sm text-green-500">{formatNumber(totalPL)}</span>
              <span className="text-sm text-green-500">({totalPLPercent}%)</span>
              <MiniLineChart data={[180000, 182000, 185000, 188000, 186500, 189000, 191000]} positive={true} />
            </div>
          </div>

          {/* Today PL Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 mb-1">今日盈亏</div>
            <div className={`text-2xl font-bold ${todayPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatNumber(todayPL)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-green-500">▲</span>
              <span className="text-sm text-green-500">+0.98%</span>
              <MiniLineChart data={[8000, -3000, 5000, 12000, 10500, 11000, 12450]} positive={todayPL >= 0} />
            </div>
          </div>

          {/* Month PL Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 mb-1">本月收益</div>
            <div className={`text-2xl font-bold ${monthPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatNumber(monthPL)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-green-500">▲</span>
              <span className="text-sm text-green-500">+3.75%</span>
              <MiniLineChart data={[30000, 32000, 28000, 35000, 40000, 42000, 45230]} positive={monthPL >= 0} />
            </div>
          </div>

          {/* Asset Allocation Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 mb-1">资产配置</div>
            <div className="mt-1">
              <PieChart />
            </div>
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">市场行情</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">查看更多 →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mockIndices.map((idx) => {
              const positive = idx.change >= 0
              return (
                <div key={idx.code} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{idx.name}</span>
                    <span className="text-xs text-gray-400">{idx.code}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{idx.value.toFixed(2)}</div>
                  <div className={`text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
                    {positive ? '▲' : '▼'} {idx.change.toFixed(2)} ({formatPercent(idx.changePercent)})
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Holdings List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">我的持仓</h2>
              <span className="text-sm text-green-500">总盈亏 {formatNumber(totalPL)}</span>
            </div>
            <Button variant="ghost" size="sm">筛选</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 font-medium">股票</th>
                  <th className="pb-2 font-medium text-right">现价</th>
                  <th className="pb-2 font-medium text-right">涨跌幅</th>
                  <th className="pb-2 font-medium text-right">持仓</th>
                  <th className="pb-2 font-medium text-right">市值</th>
                  <th className="pb-2 font-medium text-right">盈亏</th>
                  <th className="pb-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {mockStocks.map((stock) => {
                  const pl = (stock.price - stock.cost) * stock.holdings
                  const plPercent = ((stock.price - stock.cost) / stock.cost * 100).toFixed(2)
                  const positive = stock.change >= 0
                  const plPositive = pl >= 0

                  return (
                    <tr
                      key={stock.symbol}
                      className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">⭐</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{stock.name}</div>
                            <div className="text-xs text-gray-400">{stock.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                        ¥{stock.price.toFixed(2)}
                      </td>
                      <td className={`py-3 text-right ${positive ? 'text-green-500' : 'text-red-500'}`}>
                        {positive ? '▲' : '▼'} {formatPercent(stock.changePercent)}
                      </td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                        {stock.holdings} 股
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                        ¥{stock.marketValue.toLocaleString()}
                      </td>
                      <td className={`py-3 text-right ${plPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {formatNumber(pl)}
                        <div className="text-xs">{plPercent}%</div>
                      </td>
                      <td className="py-3 text-center">
                        <Button variant="ghost" size="sm">→</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">近期交易</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">查看全部 →</button>
          </div>

          <div className="space-y-3">
            {mockTransactions.map((tx, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'buy' ? '🟢' : '🔴'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{tx.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${tx.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'buy' ? '买入' : '卖出'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{tx.volume} 股 @ ¥{tx.price}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">¥{tx.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{tx.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
        onClick={() => navigate('/stock/600519')}
        title="交易"
      >
        💹
      </button>
    </div>
  )
}