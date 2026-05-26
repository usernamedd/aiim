import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_MODES } from '../../../domain/entities/AppMode'
import { useUIStore } from '../../../infrastructure/stores/ui-store'
import { useToast } from '../../components/C03-Toast/Toast'
import { Button } from '../../components/C07-Button/Button'

export function SettingsDomainPage() {
  const navigate = useNavigate()
  const { appMode, setAppMode } = useUIStore()
  const { showToast } = useToast()
  const [selectedMode, setSelectedMode] = useState(appMode)

  function handleConfirm() {
    setAppMode(selectedMode)
    const modeName = APP_MODES.find((m) => m.id === selectedMode)?.name ?? selectedMode
    showToast(`已切换至「${modeName}」`, 'success')
    setTimeout(() => navigate(-1), 1200)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">行业切换</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          选择你的行业切面，不同切面提供不同的专属功能模块。
        </p>

        <div className="space-y-4">
          {APP_MODES.map((option) => {
            const isSelected = selectedMode === option.id
            return (
              <button
                key={option.id}
                onClick={() => setSelectedMode(option.id)}
                className={`
                  w-full p-6 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {option.name}
                      </h3>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          已选择
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selectedMode === appMode}
          >
            确认切换
          </Button>
        </div>
      </main>
    </div>
  )
}
