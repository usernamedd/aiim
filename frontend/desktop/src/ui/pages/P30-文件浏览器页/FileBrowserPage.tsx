// Page: P30 文件浏览器页
import { useState } from 'react'
import { TreeView, MOCK_FILE_SYSTEM, TreeNode } from '../../components/C16-Tree/TreeView'

export function FileBrowserPage() {
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null)
  const [preview, setPreview] = useState<string>('// 选择文件以预览')

  function handleSelect(node: TreeNode) {
    setSelectedFile(node)
    if (node.type === 'file') {
      // Mock preview for demo
      const previews: Record<string, string> = {
        '/src/components/Button.tsx': `import React from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant} btn-\${size}\`}
    >
      {children}
    </button>
  )
}`,
        '/src/components/Input.tsx': `interface InputProps {
  type?: 'text' | 'password' | 'email'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

export function Input({ type = 'text', ... }: InputProps) {
  return (
    <input
      type={type}
      className={\`input \${error ? 'input-error' : ''}\`}
      {...props}
    />
  )
}`,
        '/src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
        '/package.json': `{
  "name": "aiim-desktop",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}`,
      }
      setPreview(previews[node.path] ?? `// ${node.name}\n// 文件预览（支持语法高亮）`)
    } else {
      setPreview('')
    }
  }

  return (
    <div className="flex h-full">
      {/* File Tree Panel */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            📁 文件浏览器
          </h2>
        </div>
        <div className="p-2">
          <TreeView
            nodes={MOCK_FILE_SYSTEM}
            selectedPath={selectedFile?.path}
            onSelect={handleSelect}
          />
        </div>
      </aside>

      {/* Preview Panel */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedFile ? (
          <>
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">📄</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {selectedFile.path}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-900">
              <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                {preview}
              </pre>
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
