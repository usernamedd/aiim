// Page: P41 持仓详情页（金融研究切面）
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/C07-Button/Button'

// Mock 股票数据
const mockStockData: Record<string, {
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  prevClose: number
  high: number
  low: number
  volume: string
  amount: string
  bid: number
  ask: number
  pe: number
  pb: number
  marketCap: string
  flowCap: string
  dividendYield: string
  dividend: string
  roe: string
  grossMargin: string
  holderCount: string
  holderTrend: string
  holdings: number
  cost: number
  marketValue: number
  pl: number
  plPercent: number
}> = {
  '600519': {
    name: '贵州茅台', price: 1856.00, change: 23.50, changePercent: 1.28,
    open: 1832.50, prevClose: 1832.50, high: 1870.00, low: 1830.00,
    volume: '3.2万手', amount: '5.9亿', bid: 1855.50, ask: 1856.00,
    pe: 32.5, pb: 12.3, marketCap: '2.34万亿', flowCap: '2.28万亿',
    dividendYield: '1.85%', dividend: '¥34.30', roe: '28.5%', grossMargin: '91.5%',
    holderCount: '98,532', holderTrend: '+1.2%',
    holdings: 100, cost: 1750, marketValue: 185600, pl: 10600, plPercent: 6.06
  },
  '00700': {
    name: '腾讯控股', price: 380.50, change: -1.22, changePercent: -0.32,
    open: 381.00, prevClose: 381.72, high: 385.00, low: 378.50,
    volume: '12.5万手', amount: '4.7亿', bid: 380.00, ask: 380.50,
    pe: 28.3, pb: 5.8, marketCap: '3.56万亿', flowCap: '3.42万亿',
    dividendYield: '0.85%', dividend: '¥3.20', roe: '22.1%', grossMargin: '46.2%',
    holderCount: '156,234', holderTrend: '-0.8%',
    holdings: 200, cost: 375, marketValue: 76100, pl: 1100, plPercent: 1.47
  },
  'AAPL': {
    name: '苹果公司', price: 189.30, change: 2.15, changePercent: 1.15,
    open: 187.50, prevClose: 187.15, high: 190.00, low: 186.80,
    volume: '5.2万手', amount: '9.8亿', bid: 189.25, ask: 189.30,
    pe: 29.8, pb: 45.2, marketCap: '2.89万亿', flowCap: '2.85万亿',
    dividendYield: '0.52%', dividend: '$0.96', roe: '156.8%', grossMargin: '46.2%',
    holderCount: '892,451', holderTrend: '+2.3%',
    holdings: 50, cost: 175, marketValue: 9465, pl: 715, plPercent: 8.17
  },
}

// 模拟 K 线数据
function generateCandleData(days: number) {
  const data = []
  let basePrice = 1800
  for (let i = 0; i < days; i++) {
    const open = basePrice + (Math.random() - 0.5) * 20
    const close = open + (Math.random() - 0.5) * 30
    const high = Math.max(open, close) + Math.random() * 10
    const low = Math.min(open, close) - Math.random() * 10
    data.push({ open, close, high, low })
    basePrice = close
  }
  return data
}

// K 线图 SVG
function CandlestickChart({ data, width = 600, height = 200 }: { data: { open: number, close: number, high: number, low: number }[], width?: number, height?: number }) {
  const min = Math.min(...data.flatMap(d => [d.low]))
  const max = Math.max(...data.flatMap(d => [d.high]))
  const range = max - min || 1
  const padding = 20
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const candleWidth = Math.max(3, chartWidth / data.length - 2)

  return (
    <svg width={width} height={height} className="w-full">
      {data.map((d, i) => {
        const x = padding + (i / data.length) * chartWidth + candleWidth / 2
        const yHigh = padding + chartHeight - ((d.high - min) / range) * chartHeight
        const yLow = padding + chartHeight - ((d.low - min) / range) * chartHeight
        const yOpen = padding + chartHeight - ((d.open - min) / range) * chartHeight
        const yClose = padding + chartHeight - ((d.close - min) / range) * chartHeight
        const isGreen = d.close >= d.open
        const color = isGreen ? '#22c55e' : '#ef4444'

        return (
          <g key={i}>
            {/* 上下影线 */}
            <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" />
            {/* 蜡烛体 */}
            <rect
              x={x - candleWidth / 2}
              y={Math.min(yOpen, yClose)}
              width={candleWidth}
              height={Math.max(1, Math.abs(yClose - yOpen))}
              fill={color}
            />
          </g>
        )
      })}
    </svg>
  )
}

// 分时图 SVG
function LineChart({ data, width = 600, height = 150 }: { data: number[], width?: number, height?: number }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 10
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + (height - padding * 2) - ((v - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="w-full">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill="url(#lineGradient)"
      />
    </svg>
  )
}

const timeRanges = ['分时', '日K', '周K', '月K', '年K'] as const
type TimeRange = typeof timeRanges[number]

export function StockDetailPage() {
  const navigate = useNavigate()
  const { symbol } = useParams<{ symbol: string }>()
  const [timeRange, setTimeRange] = useState<TimeRange>('日K')
  const [starred, setStarred] = useState(false)

  const stock = mockStockData[symbol || '600519'] || mockStockData['600519']
  const positive = stock.change >= 0
  const candleData = generateCandleData(30)
  const intradayData = Array.from({ length: 100 }, (_, i) => 1850 + Math.sin(i / 10) * 20 + Math.random() * 5)

  const formatNumber = (n: number) => {
    return n >= 0 ? `+¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `-¥${Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const mockNews = [
    { title: '茅台发布2026年一季度财报，营收同比增长15%', source: '东方财富', time: '2小时前', sentiment: 'positive' },
    { title: '白酒行业景气度回升，机构普遍看好龙头股', source: '同花顺', time: '昨天', sentiment: 'neutral' },
    { title: '茅台酱香系列技改项目投产，产能提升20%', source: '证券时报', time: '3天前', sentiment: 'positive' },
  ]

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      {/* TopBar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          ←
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{stock.name}</h1>
            <span className="text-sm text-gray-400">{symbol}</span>
          </div>
        </div>
        <button
          onClick={() => setStarred(!starred)}
          className={`text-xl ${starred ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          {starred ? '⭐' : '☆'}
        </button>
        <Button variant="ghost" size="sm">⋮</Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Price Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ¥{stock.price.toFixed(2)}
            </span>
            <span className={`text-xl ${positive ? 'text-green-500' : 'text-red-500'}`}>
              {positive ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)} ({positive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-sm text-gray-500 mb-4">上证</div>

          {/* Market Data Grid */}
          <div className="grid grid-cols-4 gap-3 text-sm mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">今开</div>
              <div className="font-medium text-gray-900 dark:text-white">{stock.open.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">昨收</div>
              <div className="font-medium text-gray-900 dark:text-white">{stock.prevClose.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">最高</div>
              <div className="font-medium text-green-500">{stock.high.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">最低</div>
              <div className="font-medium text-red-500">{stock.low.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">成交量</div>
              <div className="font-medium text-gray-900 dark:text-white">{stock.volume}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">成交额</div>
              <div className="font-medium text-gray-900 dark:text-white">{stock.amount}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">买价</div>
              <div className="font-medium text-gray-900 dark:text-white">{stock.bid.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-gray-500">卖价</div>
              <div className="font-medium text-gray-900 dark:text-white">{stock.ask.toFixed(2)}</div>
            </div>
          </div>

          {/* Chart */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex gap-2 mb-3">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              {timeRange === '分时' ? (
                <LineChart data={intradayData} />
              ) : (
                <CandlestickChart data={candleData} />
              )}
            </div>
          </div>
        </div>

        {/* Stock Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Valuation Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">估值指标</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">市盈率</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.pe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">市净率</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.pb}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">总市值</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">流通市值</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.flowCap}</span>
              </div>
            </div>
          </div>

          {/* Dividend Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">分红融资</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">股息率</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.dividendYield}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">每股分红</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.dividend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">净资产收益率</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.roe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">毛利率</span>
                <span className="font-medium text-gray-900 dark:text-white">{stock.grossMargin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Holding Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">我的持仓</h3>
            <Button variant="ghost" size="sm">编辑</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">持仓数量</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{stock.holdings} 股</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">成本价</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">¥{stock.cost.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">当前市值</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">¥{stock.marketValue.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">盈亏金额</div>
              <div className={`text-lg font-semibold ${stock.pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatNumber(stock.pl)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">盈亏比例</div>
              <div className={`text-lg font-semibold ${stock.plPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.plPercent >= 0 ? '+' : ''}{stock.plPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Related News */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">相关新闻</h3>
            <button className="text-sm text-blue-500 hover:text-blue-600">更多 →</button>
          </div>

          <div className="space-y-3">
            {mockNews.map((news, i) => (
              <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer">
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-white mb-1">{news.title}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{news.source}</span>
                    <span>·</span>
                    <span>{news.time}</span>
                  </div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  news.sentiment === 'positive' ? 'bg-green-100 text-green-600' :
                  news.sentiment === 'negative' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {news.sentiment === 'positive' ? '利好' : news.sentiment === 'negative' ? '利空' : '中性'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-around">
        <Button variant="secondary" size="md">行情</Button>
        <Button variant="primary" size="md">交易</Button>
        <Button variant="secondary" size="md">提醒</Button>
      </div>
    </div>
  )
}