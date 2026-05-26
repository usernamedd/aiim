// Page: P31 调试控制台页
import { useState } from 'react'
import { EmptyState } from '../../components/C11-EmptyState/EmptyState'

// ============ Types ============
type DebugSessionStatus = 'running' | 'paused' | 'stopped'
type LogLevel = 'info' | 'warn' | 'error' | 'debug'
type BreakpointStatus = 'active' | 'disabled' | 'conditional'

interface StackFrame {
  id: string
  file: string
  line: number
  functionName: string
  isCurrent: boolean
}

interface SourceFile {
  path: string
  lines: string[]
  breakpoints: Map<number, BreakpointStatus>
  currentLine: number
}

interface Variable {
  name: string
  type: string
  value: string | Record<string, Variable>
  expanded?: boolean
}

interface ScopeSection {
  name: string
  variables: Variable[]
}

interface WatchItem {
  id: string
  expression: string
  value: string
}

interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp: Date
  expanded?: boolean
}

// ============ Mock Data ============
const MOCK_STACK_FRAMES: StackFrame[] = [
  { id: '1', file: 'app.tsx', line: 42, functionName: 'handleClick()', isCurrent: true },
  { id: '2', file: 'index.tsx', line: 15, functionName: 'render()', isCurrent: false },
  { id: '3', file: 'App.tsx', line: 8, functionName: 'mount()', isCurrent: false },
  { id: '4', file: 'main.tsx', line: 3, functionName: 'bootstrap()', isCurrent: false },
]

const MOCK_SOURCE_CODE = `import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

const handleClick = () => {
  const count = 5
  console.log('Clicked:', count)
  return count + 1
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(handleClick())}>
        Click me
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

export default App`

const MOCK_SCOPES: ScopeSection[] = [
  {
    name: '局部变量',
    variables: [
      { name: 'count', type: 'number', value: '5' },
      { name: 'setCount', type: 'function', value: 'ƒ setCount()' },
      { name: 'loading', type: 'boolean', value: 'true' },
    ]
  },
  {
    name: '闭包变量',
    variables: [
      { name: 'result', type: 'object', value: { name: 'result', type: 'Response', value: { status: 200, ok: true } } }
    ]
  },
  {
    name: '全局变量',
    variables: [
      { name: 'window', type: 'Window', value: '{...}' },
      { name: 'document', type: 'Document', value: '{...}' },
    ]
  }
]

const MOCK_LOGS: LogEntry[] = [
  { id: '1', level: 'info', message: '[webpack] Compiled successfully in 125ms', timestamp: new Date('2026-05-26T10:30:01') },
  { id: '2', level: 'info', message: 'Type: number', timestamp: new Date('2026-05-26T10:30:02') },
  { id: '3', level: 'warn', message: 'Warning: React DevTools is not installed', timestamp: new Date('2026-05-26T10:30:03') },
  { id: '4', level: 'error', message: 'Error: Cannot read properties of undefined (reading \'value\')', timestamp: new Date('2026-05-26T10:30:04') },
  { id: '5', level: 'debug', message: 'State updated: { count: 5 }', timestamp: new Date('2026-05-26T10:30:05') },
]

// ============ Components ============

// TopBar Component
function TopBar({ status, sessionName, onRestart, onStop }: {
  status: DebugSessionStatus
  sessionName: string
  onRestart: () => void
  onStop: () => void
}) {
  const statusColors = {
    running: 'bg-green-500',
    paused: 'bg-yellow-500',
    stopped: 'bg-gray-400'
  }

  const statusLabels = {
    running: '● 运行中',
    paused: '⏸ 暂停',
    stopped: '⏹ 已停止'
  }

  return (
    <header className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200">调试控制台</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          <span className="text-sm text-gray-600 dark:text-gray-300">{sessionName}</span>
          <span className="text-xs text-gray-500">{statusLabels[status]}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onRestart}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
            title="重启调试"
          >
            ⟳
          </button>
          <button
            onClick={onStop}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
            title="停止调试"
          >
            ⏹
          </button>
        </div>
      </div>
    </header>
  )
}

// DebugToolbar Component
function DebugToolbar({ status, onRun, onPause, onStop, onStepOver, onStepInto, onStepOut, onAddWatch, breakpointsEnabled }: {
  status: DebugSessionStatus
  onRun: () => void
  onPause: () => void
  onStop: () => void
  onStepOver: () => void
  onStepInto: () => void
  onStepOut: () => void
  onAddWatch: (expr: string) => void
  breakpointsEnabled: boolean
}) {
  const [watchInput, setWatchInput] = useState('')
  const [watches, setWatches] = useState<WatchItem[]>([
    { id: '1', expression: 'count + 1', value: '6' }
  ])

  const handleAddWatch = () => {
    if (watchInput.trim()) {
      setWatches([...watches, { id: Date.now().toString(), expression: watchInput, value: 'undefined' }])
      onAddWatch(watchInput)
      setWatchInput('')
    }
  }

  const isDisabled = status === 'stopped'

  return (
    <div className="h-11 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-4">
      {/* Control Group */}
      <div className="flex items-center gap-1">
        <button
          onClick={onRun}
          disabled={isDisabled || status === 'running'}
          className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-green-600 disabled:opacity-40"
          title="继续运行"
        >
          ▶
        </button>
        <button
          onClick={onPause}
          disabled={isDisabled || status === 'paused'}
          className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-yellow-600 disabled:opacity-40"
          title="暂停"
        >
          ⏸
        </button>
        <button
          onClick={onStop}
          disabled={isDisabled}
          className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600 disabled:opacity-40"
          title="停止"
        >
          ⏹
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* Step Group */}
      <div className="flex items-center gap-1">
        <button
          onClick={onStepOver}
          disabled={isDisabled || status === 'running'}
          className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-blue-600 disabled:opacity-40"
          title="Step Over (跳过函数)"
        >
          ➡
        </button>
        <button
          onClick={onStepInto}
          disabled={isDisabled || status === 'running'}
          className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-blue-600 disabled:opacity-40"
          title="Step Into (进入函数)"
        >
          ➡̸
        </button>
        <button
          onClick={onStepOut}
          disabled={isDisabled || status === 'running'}
          className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-blue-600 disabled:opacity-40"
          title="Step Out (跳出函数)"
        >
          ⏭
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* Watch Group */}
      <div className="flex items-center gap-2">
        <div className="relative group">
          <button
            className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-purple-600"
            title="添加监视"
          >
            👁 +
          </button>
          {/* Watch Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 hidden group-hover:block">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={watchInput}
                onChange={(e) => setWatchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWatch()}
                placeholder="输入监视表达式..."
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            {watches.map(watch => (
              <div key={watch.id} className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">{watch.expression}</span>
                <span className="text-purple-600 ml-2">{watch.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Breakpoint Toggle */}
      <button
        onClick={() => {}}
        className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${breakpointsEnabled ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 'bg-gray-200 text-gray-500'}`}
      >
        <span className="w-2 h-2 rounded-full bg-red-500" />
        断点
      </button>
    </div>
  )
}

// CallStackPanel Component
function CallStackPanel({ frames, onFrameClick }: {
  frames: StackFrame[]
  onFrameClick: (frame: StackFrame) => void
}) {
  return (
    <aside className="w-[180px] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
      <div className="h-9 px-3 flex items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          调用栈
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-1">
        {frames.length === 0 ? (
          <div className="p-3 text-xs text-gray-400 text-center">无调用栈</div>
        ) : (
          frames.map(frame => (
            <button
              key={frame.id}
              onClick={() => onFrameClick(frame)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-2 ${
                frame.isCurrent ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500' : ''
              }`}
            >
              <span className="mt-0.5">
                {frame.isCurrent ? '▶' : ''}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {frame.file}:{frame.line}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 truncate font-mono">
                  {frame.functionName}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}

// SourceViewer Component
function SourceViewer({ file, onBreakpointToggle }: {
  file: SourceFile
  onBreakpointToggle: (line: number) => void
}) {
  const lines = file.lines

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-gray-900">
      {/* Tab Bar */}
      <div className="h-9 bg-gray-800 flex items-center px-2 border-b border-gray-700">
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-200">
          <span className="text-gray-400">📄</span>
          <span>{file.path}</span>
          <button className="ml-1 hover:text-white">×</button>
        </div>
        <button className="ml-2 px-2 py-1 text-gray-400 hover:text-white text-xl">+</button>
      </div>

      {/* Source Content */}
      <div className="flex-1 overflow-auto font-mono text-sm">
        <div className="flex">
          {/* Line Numbers */}
          <div className="text-right pr-4 pl-4 text-gray-500 select-none bg-gray-950 sticky left-0">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">{i + 1}</div>
            ))}
          </div>

          {/* Breakpoint Gutter */}
          <div className="w-8 bg-gray-900 sticky left-16">
            {lines.map((_, i) => {
              const lineNum = i + 1
              const bpStatus = file.breakpoints.get(lineNum)
              return (
                <button
                  key={i}
                  onClick={() => onBreakpointToggle(lineNum)}
                  className="w-full h-6 flex items-center justify-center hover:bg-gray-800"
                >
                  {bpStatus === 'active' && <span className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                  {bpStatus === 'disabled' && <span className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-transparent" />}
                  {bpStatus === 'conditional' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 text-xs leading-none">?</span>}
                  {!bpStatus && <span className="w-2.5 h-2.5" />}
                </button>
              )
            })}
          </div>

          {/* Source Lines */}
          <div className="flex-1 text-gray-100">
            {lines.map((line, i) => {
              const lineNum = i + 1
              const isCurrentLine = lineNum === file.currentLine
              const hasBreakpoint = file.breakpoints.has(lineNum)
              
              return (
                <div
                  key={i}
                  className={`leading-6 px-2 ${
                    isCurrentLine ? 'bg-blue-900/50 border-l-2 border-blue-400' : ''
                  } ${hasBreakpoint ? 'bg-red-900/20' : ''}`}
                >
                  <span className="text-gray-400">{line}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

// VariableItem Component
function VariableItem({ variable, depth = 0 }: { variable: Variable; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const isObject = typeof variable.value === 'object' && variable.value !== null

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
        {isObject && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
        <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">
          {variable.name}
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded">
          {variable.type}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">
          {isObject ? (expanded ? '' : '{...}') : variable.value}
        </span>
        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xs">
          📋
        </button>
      </div>
      
      {expanded && isObject && (
        <div className="ml-2">
          {Object.entries(variable.value as Record<string, Variable>).map(([key, val]) => (
            <VariableItem key={key} variable={{ name: key, ...val }} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ScopeSection Component
function ScopeSection({ scope }: { scope: ScopeSection }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <span className="text-xs text-gray-400">{expanded ? '▼' : '▶'}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{scope.name}</span>
        <span className="text-xs text-gray-400">({scope.variables.length})</span>
      </button>
      
      {expanded && (
        <div className="pb-1">
          {scope.variables.map((v, i) => (
            <VariableItem key={i} variable={v} />
          ))}
        </div>
      )}
    </div>
  )
}

// VariablesPanel Component
function VariablesPanel({ scopes }: { scopes: ScopeSection[] }) {
  const [filter, setFilter] = useState('')

  const filteredScopes = scopes.map(scope => ({
    ...scope,
    variables: scope.variables.filter(v => 
      v.name.toLowerCase().includes(filter.toLowerCase())
    )
  })).filter(scope => scope.variables.length > 0)

  return (
    <aside className="w-[240px] border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
      <div className="h-9 px-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          变量
        </h2>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="🔍"
          className="w-20 px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredScopes.map((scope, i) => (
          <ScopeSection key={i} scope={scope} />
        ))}

        {/* Watch Section */}
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">监视</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 bg-purple-50 dark:bg-purple-900/30 rounded text-sm">
              <span className="text-purple-700 dark:text-purple-300 font-mono">[count + 1]</span>
              <span className="text-purple-600">6</span>
            </div>
            <input
              type="text"
              placeholder="+ 添加监视"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

// LogEntry Component
function LogEntry({ entry, onToggle }: { entry: LogEntry; onToggle: () => void }) {
  const levelConfig = {
    info: { icon: 'ℹ️', color: 'text-blue-500', bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    warn: { icon: '⚠️', color: 'text-yellow-500', bg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20' },
    error: { icon: '✕', color: 'text-red-500', bg: 'hover:bg-red-50 dark:hover:bg-red-900/20' },
    debug: { icon: '🐛', color: 'text-gray-500', bg: 'hover:bg-gray-50 dark:hover:bg-gray-700/20' },
  }

  const config = levelConfig[entry.level]
  const timeStr = entry.timestamp.toLocaleTimeString('zh-CN', { hour12: false })

  return (
    <div className={`flex items-start gap-2 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 ${config.bg}`}>
      <span className={`${config.color} mt-0.5`}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">{entry.message}</span>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{timeStr}</span>
      <button onClick={onToggle} className="text-gray-400 hover:text-gray-600 text-xs">
        ▶
      </button>
    </div>
  )
}

// ConsolePanel Component
function ConsolePanel({ logs, collapsed, onToggle }: {
  logs: LogEntry[]
  collapsed: boolean
  onToggle: () => void
}) {
  const [filter, setFilter] = useState<LogLevel | 'all'>('all')

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(l => l.level === filter)

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col ${collapsed ? 'h-9' : 'h-[150px]'}`}>
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onToggle} className="text-gray-500 hover:text-gray-700">
            {collapsed ? '▶' : '▼'}
          </button>
          <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            控制台
          </h2>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(['all', 'info', 'warn', 'error'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-2 py-0.5 text-xs rounded ${
                    filter === level 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {level === 'all' ? '全部' : level === 'info' ? '信息' : level === 'warn' ? '警告' : '错误'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="清空">
                🗑
              </button>
              <button onClick={onToggle} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="收起">
                ▲
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log List */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {filteredLogs.map(entry => (
            <LogEntry key={entry.id} entry={entry} onToggle={() => {}} />
          ))}
          {filteredLogs.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-400">无日志</div>
          )}
        </div>
      )}
    </div>
  )
}

// ============ Main Page Component ============
export function DebugConsolePage() {
  const [status, setStatus] = useState<DebugSessionStatus>('paused')
  const [sessionName] = useState('my-app:3000')
  const [consoleCollapsed, setConsoleCollapsed] = useState(false)
  const [breakpointsEnabled, setBreakpointsEnabled] = useState(true)

  // Mock source file state
  const [sourceFile] = useState<SourceFile>(() => {
    const lines = MOCK_SOURCE_CODE.split('\n')
    const breakpoints = new Map<number, BreakpointStatus>()
    breakpoints.set(19, 'active')
    breakpoints.set(25, 'conditional')
    return {
      path: 'app.tsx',
      lines,
      breakpoints,
      currentLine: 19
    }
  })

  const handleBreakpointToggle = (line: number) => {
    // Toggle breakpoint implementation
    console.log('Toggle breakpoint at line:', line)
  }

  const handleFrameClick = (frame: StackFrame) => {
    // Switch to frame implementation
    console.log('Selected frame:', frame)
  }

  // Empty state when no debug session
  if (status === 'stopped') {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
        <TopBar status={status} sessionName={sessionName} onRestart={() => setStatus('running')} onStop={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="🐛"
            title="启动调试会话"
            description="点击调试按钮启动一个调试会话"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* TopBar */}
      <TopBar
        status={status}
        sessionName={sessionName}
        onRestart={() => setStatus('running')}
        onStop={() => setStatus('stopped')}
      />

      {/* Debug Toolbar */}
      <DebugToolbar
        status={status}
        breakpointsEnabled={breakpointsEnabled}
        onRun={() => setStatus('running')}
        onPause={() => setStatus('paused')}
        onStop={() => setStatus('stopped')}
        onStepOver={() => {}}
        onStepInto={() => {}}
        onStepOut={() => {}}
        onAddWatch={() => {}}
      />

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Call Stack Panel */}
        <CallStackPanel
          frames={MOCK_STACK_FRAMES}
          onFrameClick={handleFrameClick}
        />

        {/* Source Viewer */}
        <SourceViewer
          file={sourceFile}
          onBreakpointToggle={handleBreakpointToggle}
        />

        {/* Variables Panel */}
        <VariablesPanel scopes={MOCK_SCOPES} />
      </div>

      {/* Console Panel */}
      <ConsolePanel
        logs={MOCK_LOGS}
        collapsed={consoleCollapsed}
        onToggle={() => setConsoleCollapsed(!consoleCollapsed)}
      />
    </div>
  )
}