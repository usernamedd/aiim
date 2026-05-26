// Page: P50 个人设置页
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../../infrastructure/stores/ui-store';
import { Button } from '../../components/C07-Button/Button';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { APP_MODES } from '../../../domain/entities/AppMode';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { appMode, setAppMode, theme, setTheme } = useUIStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>←</Button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">设置</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <Avatar
              name={user?.nickname || user?.username || 'User'}
              src={user?.avatar}
              size="xl"
              isOnline
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {user?.nickname || user?.username}
              </p>
              <p className="text-sm text-slate-500">@{user?.username}</p>
            </div>
          </div>

          {/* App Mode */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">行业切面</h3>
            <div className="space-y-2">
              {APP_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAppMode(mode.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    appMode === mode.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mode.icon}</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{mode.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{mode.description}</p>
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => navigate('/settings/domain')}
                className="w-full p-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                详细设置 →
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">主题</h3>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t === 'light' ? '☀️ 浅色' : t === 'dark' ? '🌙 深色' : '💻 自动'}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="danger"
              size="md"
              className="w-full"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p>设置页面 · 更多选项后续添加</p>
        </div>
      </main>
    </div>
  );
}
