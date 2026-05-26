// Page: P30 文件浏览器页
import { useState, useEffect, useCallback } from 'react'
import { readDir, readTextFile, stat, type DirEntry } from '@tauri-apps/plugin-fs'
import { TreeView, TreeNode } from '../../components/C16-Tree/TreeView'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const ROOT_PATH = '/home/ddx/aiim'

// Convert Tauri DirEntry to TreeNode
async function dirEntryToTreeNode(entry: DirEntry, parentPath: string): Promise<TreeNode> {
  const fullPath = `${parentPath}/${entry.name}`
  const node: TreeNode = {
    id: fullPath,
    name: entry.name,
    type: entry.isDirectory ? 'folder' : 'file',
    path: fullPath,
  }
  
  if (entry.isDirectory) {
    node.children = []
  } else {
    try {
      const fileStat = await stat(fullPath)
      node.size = fileStat.size
      node.modifiedTime = fileStat.mtime ? new Date(fileStat.mtime).getTime() : undefined
    } catch {
      // Ignore stat errors for now
    }
  }
  
  return node
}

// Load directory contents recursively
async function loadDirectory(path: string, depth: number = 0): Promise<TreeNode[]> {
  if (depth > 3) return [] // Prevent too deep recursion
  
  try {
    const entries = await readDir(path)
    const nodes: TreeNode[] = []
    
    for (const entry of entries) {
      const node = await dirEntryToTreeNode(entry, path)
      
      if (entry.isDirectory) {
        const children = await loadDirectory(node.path, depth + 1)
        node.children = children
      }
      
      nodes.push(node)
    }
    
    // Sort: folders first, then files alphabetically
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error(`Failed to load directory ${path}:`, error)
    return []
  }
}

// Format file size
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Breadcrumb Toolbar Component
function BreadcrumbToolbar({ 
  path, 
  onNavigate 
}: { 
  path: string
  onNavigate: (path: string) => void 
}) {
  const parts = path.split('/').filter(Boolean)
  const breadcrumbs = [
    { name: 'root', path: '/' },
    ...parts.map((part, i) => ({
      name: part,
      path: '/' + parts.slice(0, i + 1).join('/')
    }))
  ]
  
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm overflow-x-auto">
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center">
          {i > 0 && <span className="mx-1 text-gray-400">/</span>}
          <button
            onClick={() => onNavigate(crumb.path)}
            className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              i === breadcrumbs.length - 1 
                ? 'font-semibold text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </div>
  )
}

export function FileBrowserPage() {
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null)
  const [preview, setPreview] = useState<string>('// 选择文件以预览')
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [fileTree, setFileTree] = useState<TreeNode[]>([])
  const [currentPath, setCurrentPath] = useState<string>(ROOT_PATH)
  const [loading, setLoading] = useState(true)

  // Load file tree
  useEffect(() => {
    setLoading(true)
    loadDirectory(ROOT_PATH).then(nodes => {
      setFileTree(nodes)
      setLoading(false)
    })
  }, [])

  // Load file content for preview
  const loadFilePreview = useCallback(async (node: TreeNode) => {
    if (node.type !== 'file') {
      setPreview('')
      setHighlightedCode('')
      return
    }
    
    try {
      const content = await readTextFile(node.path)
      setPreview(content)
      
      // Syntax highlight
      const ext = node.name.split('.').pop()?.toLowerCase() ?? ''
      const langMap: Record<string, string> = {
        ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
        json: 'json', md: 'markdown', txt: 'plaintext', py: 'python',
        css: 'css', scss: 'scss', html: 'html', rs: 'rust', go: 'go',
        sh: 'bash', yaml: 'yaml', yml: 'yaml', toml: 'toml',
      }
      const lang = langMap[ext] ?? 'plaintext'
      
      try {
        const result = hljs.highlight(content, { language: lang })
        setHighlightedCode(result.value)
      } catch {
        setHighlightedCode(`<pre>${content}</pre>`)
      }
    } catch (error) {
      setPreview(`// Failed to load file: ${error}`)
      setHighlightedCode('')
    }
  }, [])

  function handleSelect(node: TreeNode) {
    setSelectedFile(node)
    loadFilePreview(node)
  }

  function handleBreadcrumbNavigate(path: string) {
    // Reset to root for now - full navigation would reload tree at different paths
    setCurrentPath(path)
  }

  return (
    <div className="flex h-full">
      {/* File Tree Panel */}
      <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            📁 文件浏览器
          </h2>
          <p className="text-xs text-gray-500 mt-1 truncate">{ROOT_PATH}</p>
        </div>
        <div className="p-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : (
            <TreeView
              nodes={fileTree}
              selectedPath={selectedFile?.path}
              onSelect={handleSelect}
            />
          )}
        </div>
      </aside>

      {/* Preview Panel */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <BreadcrumbToolbar path={currentPath} onNavigate={handleBreadcrumbNavigate} />
        
        {selectedFile ? (
          <>
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">📄</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {selectedFile.path}
                </span>
                {selectedFile.size !== undefined && (
                  <span className="text-xs text-gray-400">
                    {formatSize(selectedFile.size)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-900">
              {highlightedCode ? (
                <pre className="text-sm font-mono">
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                </pre>
              ) : (
                <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                  {preview}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">📂</div>
              <p>从左侧选择一个文件进行预览</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
