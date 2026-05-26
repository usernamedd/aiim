// Page: P32 差异对比页
import { useState, useRef, useEffect } from 'react'
import { EmptyState } from '../../components/C11-EmptyState/EmptyState'

// ============ Types ============
type ViewMode = 'split' | 'unified'
type DiffType = 'unchanged' | 'added' | 'deleted' | 'modified'

interface DiffLine {
  leftLineNum: number | null
  rightLineNum: number | null
  content: string
  type: DiffType
}

interface FileOption {
  name: string
  path: string
  ref?: string
}

interface DiffStats {
  added: number
  deleted: number
  modified: number
}

// ============ Mock Data ============
const MOCK_FILES: FileOption[] = [
  { name: 'Button.tsx', path: '/src/components/Button.tsx', ref: 'v1.2.0' },
  { name: 'Input.tsx', path: '/src/components/Input.tsx', ref: 'v1.1.5' },
  { name: 'App.tsx', path: '/src/App.tsx', ref: 'HEAD' },
  { name: 'main.tsx', path: '/src/main.tsx', ref: 'develop' },
  { name: 'index.css', path: '/src/index.css', ref: 'feature/new-ui' },
]

const MOCK_DIFF_LINES: DiffLine[] = [
  { leftLineNum: 1, rightLineNum: 1, content: "import React from 'react'", type: 'unchanged' },
  { leftLineNum: 2, rightLineNum: 2, content: "import { useState } from 'react';", type: 'deleted' },
  { leftLineNum: null, rightLineNum: 3, content: "import { useState, useEffect } from 'react';", type: 'added' },
  { leftLineNum: null, rightLineNum: 4, content: "import { Button } from './Button';", type: 'added' },
  { leftLineNum: 3, rightLineNum: 5, content: "", type: 'unchanged' },
  { leftLineNum: 4, rightLineNum: 6, content: "interface Props {", type: 'unchanged' },
  { leftLineNum: 5, rightLineNum: 7, content: "  children: React.ReactNode", type: 'modified' },
  { leftLineNum: 6, rightLineNum: null, content: "  title?: string", type: 'deleted' },
  { leftLineNum: null, rightLineNum: 8, content: "  title?: string;", type: 'added' },
  { leftLineNum: 7, rightLineNum: 9, content: "}", type: 'unchanged' },
  { leftLineNum: 8, rightLineNum: 10, content: "", type: 'unchanged' },
  { leftLineNum: 9, rightLineNum: 11, content: "export function App() {", type: 'unchanged' },
  { leftLineNum: 10, rightLineNum: 12, content: "  const [count, setCount] = useState(0);", type: 'deleted' },
  { leftLineNum: null, rightLineNum: 13, content: "  const [count, setCount] = useState(0);", type: 'added' },
  { leftLineNum: 11, rightLineNum: 14, content: "  const [loading, setLoading] = useState(true);", type: 'added' },
  { leftLineNum: 12, rightLineNum: 15, content: "  ", type: 'unchanged' },
  { leftLineNum: 13, rightLineNum: 16, content: "  return (", type: 'unchanged' },
  { leftLineNum: 14, rightLineNum: 17, content: "    <div>", type: 'unchanged' },
  { leftLineNum: 15, rightLineNum: 18, content: "      <Button>点击</Button>", type: 'modified' },
  { leftLineNum: 16, rightLineNum: 19, content: "    </div>", type: 'unchanged' },
  { leftLineNum: 17, rightLineNum: 20, content: "  );", type: 'unchanged' },
  { leftLineNum: 18, rightLineNum: 21, content: "}", type: 'unchanged' },
]

const MOCK_STATS: DiffStats = { added: 5, deleted: 3, modified: 3 }

// ============ File Selector Component ============
interface FileSelectorProps {
  label: string
  selectedFile: FileOption | null
  onSelect: (file: FileOption) => void
}

function FileSelector({ label, selectedFile, onSelect }: FileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredFiles = MOCK_FILES.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <span className="text-xs text-gray-500 mr-2">{label}</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-w-[180px]"
      >
        <span className="text-sm">📄</span>
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 text-left truncate">
          {selectedFile?.name || '选择文件...'}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              type="text"
              placeholder="搜索文件..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-transparent focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredFiles.map(file => (
              <button
                key={file.path}
                onClick={() => { onSelect(file); setIsOpen(false) }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">📄</span>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{file.path}</div>
                </div>
                {file.ref && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-gray-500 dark:text-gray-400">
                    {file.ref}
                  </span>
                )}
              </button>
            ))}
            {filteredFiles.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">未找到文件</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============ Swap Button ============
function SwapButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      title="交换 A/B 文件"
    >
      ⇄
    </button>
  )
}

// ============ Diff Toolbar ============
interface DiffToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  currentChangeIndex: number
  totalChanges: number
  onPrevChange: () => void
  onNextChange: () => void
  stats: DiffStats
}

function DiffToolbar({
  viewMode,
  onViewModeChange,
  currentChangeIndex,
  totalChanges,
  onPrevChange,
  onNextChange,
  stats
}: DiffToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevChange}
          disabled={totalChanges === 0}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          title="上一处变更"
        >
          ⬆
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[48px] text-center">
          {totalChanges > 0 ? `${currentChangeIndex + 1}/${totalChanges}` : '0/0'}
        </span>
        <button
          onClick={onNextChange}
          disabled={totalChanges === 0}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          title="下一处变更"
        >
          ⬇
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded p-0.5">
        <button
          onClick={() => onViewModeChange('split')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            viewMode === 'split'
              ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title="并排视图"
        >
          ‖
        </button>
        <button
          onClick={() => onViewModeChange('unified')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            viewMode === 'unified'
              ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title="合并视图"
        >
          ≡
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-green-600 dark:text-green-400" title="新增行数">
          🟢 +{stats.added}
        </span>
        <span className="text-red-600 dark:text-red-400" title="删除行数">
          🔴 -{stats.deleted}
        </span>
        <span className="text-yellow-600 dark:text-yellow-400" title="修改行数">
          🟡 ~{stats.modified}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="复制 Diff">
          📋
        </button>
        <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="创建补丁">
          📦
        </button>
        <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="更多">
          ⚙️
        </button>
      </div>
    </div>
  )
}

// ============ Diff Legend ============
function DiffLegend() {
  const items: { color: string; bg: string; label: string }[] = [
    { color: '🟢', bg: 'bg-green-100 dark:bg-green-900/30', label: '新增' },
    { color: '🔴', bg: 'bg-red-100 dark:bg-red-900/30', label: '删除' },
    { color: '🟡', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: '修改' },
    { color: '⬜', bg: 'bg-gray-100 dark:bg-gray-700', label: '未变' },
  ]

  return (
    <div className="flex items-center justify-center gap-6 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-4 h-4 rounded ${item.bg} flex items-center justify-center text-xs`}>
            {item.color}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ============ Diff Line Component ============
function getLineStyle(type: DiffType): string {
  switch (type) {
    case 'added':
      return 'bg-green-100 dark:bg-green-900/30'
    case 'deleted':
      return 'bg-red-100 dark:bg-red-900/30'
    case 'modified':
      return 'bg-yellow-100 dark:bg-yellow-900/30'
    default:
      return ''
  }
}

function getIndicator(type: DiffType): string {
  switch (type) {
    case 'added':
      return '+'
    case 'deleted':
      return '-'
    case 'modified':
      return '~'
    default:
      return ' '
  }
}

interface DiffLineProps {
  line: DiffLine
  showLineNumbers?: boolean
  showIndicator?: boolean
}

function DiffLineComponent({ line, showLineNumbers = true, showIndicator = true }: DiffLineProps) {
  return (
    <div className={`flex items-start font-mono text-sm leading-6 ${getLineStyle(line.type)}`}>
      {showLineNumbers && (
        <div className="flex w-12 shrink-0">
          <span className="w-6 text-right pr-2 text-gray-400 select-none">
            {line.leftLineNum ?? ''}
          </span>
          <span className="w-6 text-right pr-2 text-gray-400 select-none">
            {line.rightLineNum ?? ''}
          </span>
        </div>
      )}
      {showIndicator && (
        <span className="w-6 text-center select-none">
          {getIndicator(line.type)}
        </span>
      )}
      <span className="flex-1 px-2 whitespace-pre-wrap break-all">
        {line.content || ' '}
      </span>
    </div>
  )
}

// ============ Split View ============
interface SplitViewProps {
  leftFile: FileOption | null
  rightFile: FileOption | null
  lines: DiffLine[]
}

function SplitView({ leftFile, rightFile, lines }: SplitViewProps) {
  const leftLines = lines.filter(l => l.leftLineNum !== null)
  const rightLines = lines.filter(l => l.rightLineNum !== null)

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {leftFile?.name || '旧文件'} 
          </span>
          {leftFile?.ref && (
            <span className="ml-2 text-xs text-gray-400">{leftFile.ref}</span>
          )}
        </div>
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {leftLines.map((line, i) => (
            <DiffLineComponent key={i} line={line} showIndicator={false} />
          ))}
        </div>
      </div>

      {/* Gutter Divider */}
      <div className="w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize shrink-0" />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {rightFile?.name || '新文件'}
          </span>
          {rightFile?.ref && (
            <span className="ml-2 text-xs text-gray-400">{rightFile.ref}</span>
          )}
        </div>
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {rightLines.map((line, i) => (
            <DiffLineComponent key={i} line={line} showIndicator={false} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ Unified View ============
interface UnifiedViewProps {
  leftFile: FileOption | null
  rightFile: FileOption | null
  lines: DiffLine[]
}

function UnifiedView({ leftFile, rightFile, lines }: UnifiedViewProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Unified Header */}
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          --- a/{leftFile?.path || 'old'}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          +++ b/{rightFile?.path || 'new'}
        </span>
      </div>
      {/* Unified Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {lines.map((line, i) => (
          <DiffLineComponent key={i} line={line} showLineNumbers={true} showIndicator={true} />
        ))}
      </div>
    </div>
  )
}

// ============ Main Diff Viewer Page ============
export function DiffViewerPage() {
  const [leftFile, setLeftFile] = useState<FileOption | null>(null)
  const [rightFile, setRightFile] = useState<FileOption | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0)

  // Mock change positions for navigation demo
  const changePositions = MOCK_DIFF_LINES
    .map((line, idx) => ({ idx, type: line.type }))
    .filter(l => l.type !== 'unchanged')
  
  const totalChanges = changePositions.length

  const handleSwap = () => {
    const temp = leftFile
    setLeftFile(rightFile)
    setRightFile(temp)
  }

  const handlePrevChange = () => {
    setCurrentChangeIndex(prev => Math.max(0, prev - 1))
  }

  const handleNextChange = () => {
    setCurrentChangeIndex(prev => Math.min(totalChanges - 1, prev + 1))
  }

  const hasFiles = leftFile && rightFile

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* TopBar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">差异对比</h1>
        <div className="flex items-center gap-3">
          <FileSelector
            label="A"
            selectedFile={leftFile}
            onSelect={setLeftFile}
          />
          <SwapButton onClick={handleSwap} />
          <FileSelector
            label="B"
            selectedFile={rightFile}
            onSelect={setRightFile}
          />
        </div>
      </div>

      {/* Diff Toolbar */}
      {hasFiles && (
        <DiffToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentChangeIndex={currentChangeIndex}
          totalChanges={totalChanges}
          onPrevChange={handlePrevChange}
          onNextChange={handleNextChange}
          stats={MOCK_STATS}
        />
      )}

      {/* Diff Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {hasFiles ? (
          viewMode === 'split' ? (
            <SplitView
              leftFile={leftFile}
              rightFile={rightFile}
              lines={MOCK_DIFF_LINES}
            />
          ) : (
            <UnifiedView
              leftFile={leftFile}
              rightFile={rightFile}
              lines={MOCK_DIFF_LINES}
            />
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon="≡"
              title="选择两个版本进行对比"
              description="从上方选择两个文件或 Git 引用来查看差异"
            />
          </div>
        )}
      </div>

      {/* Diff Legend */}
      {hasFiles && <DiffLegend />}
    </div>
  )
}

export default DiffViewerPage
