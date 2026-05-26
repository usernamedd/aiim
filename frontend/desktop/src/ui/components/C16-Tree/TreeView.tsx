// Component: C16 Tree (文件树控件)
import { useState } from 'react'

export interface TreeNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: TreeNode[]
  path: string
}

interface TreeViewProps {
  nodes: TreeNode[]
  selectedPath?: string
  onSelect?: (node: TreeNode) => void
}

function TreeNodeView({ node, depth, selectedPath, onSelect }: {
  node: TreeNode
  depth: number
  selectedPath?: string
  onSelect?: (node: TreeNode) => void
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const isSelected = selectedPath === node.path

  const hasChildren = node.type === 'folder' && node.children && node.children.length > 0
  const icon = node.type === 'folder'
    ? (expanded ? '📂' : '📁')
    : getFileIcon(node.name)

  return (
    <div>
      <button
        onClick={() => {
          if (node.type === 'folder') {
            setExpanded(!expanded)
          }
          onSelect?.(node)
        }}
        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === 'folder' && (
          <span className="text-xs w-4 text-center">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        <span>{icon}</span>
        <span className="truncate">{node.name}</span>
      </button>

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    ts: '🔷', tsx: '🔷', js: '🟡', jsx: '🟡',
    json: '🟦', md: '📝', txt: '📄',
    png: '🖼️', jpg: '🖼️', svg: '🖼️', gif: '🖼️',
    css: '🎨', scss: '🎨', less: '🎨',
    html: '🌐', py: '🐍', go: '🔵', rs: '🦀',
    sh: '📟', bash: '📟',
  }
  return iconMap[ext ?? ''] ?? '📄'
}

export function TreeView({ nodes, selectedPath, onSelect }: TreeViewProps) {
  return (
    <div className="font-mono text-sm">
      {nodes.map((node) => (
        <TreeNodeView
          key={node.id}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

// Mock file system data for demo
export const MOCK_FILE_SYSTEM: TreeNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          { id: '3', name: 'Button.tsx', type: 'file', path: '/src/components/Button.tsx' },
          { id: '4', name: 'Input.tsx', type: 'file', path: '/src/components/Input.tsx' },
          { id: '5', name: 'Avatar.tsx', type: 'file', path: '/src/components/Avatar.tsx' },
        ],
      },
      {
        id: '6',
        name: 'pages',
        type: 'folder',
        path: '/src/pages',
        children: [
          { id: '7', name: 'LoginPage.tsx', type: 'file', path: '/src/pages/LoginPage.tsx' },
          { id: '8', name: 'HomePage.tsx', type: 'file', path: '/src/pages/HomePage.tsx' },
        ],
      },
      { id: '9', name: 'main.tsx', type: 'file', path: '/src/main.tsx' },
      { id: '10', name: 'App.tsx', type: 'file', path: '/src/App.tsx' },
    ],
  },
  {
    id: '11',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
  },
  {
    id: '12',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
  },
]
