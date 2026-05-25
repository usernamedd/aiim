// Page: P01 登录页
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/C07-Button/Button';
import { Input } from '../../components/C08-Input/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ username, password });
      navigate('/home');
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AIIM</h1>
          <p className="text-slate-400">AI即时通讯 · 智能助手</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">登录</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              登录
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700">
              忘记密码？
            </Link>
            <Link to="/register" className="text-blue-600 hover:text-blue-700">
              注册账号
            </Link>
          </div>

          {/* Mock hint */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 text-center">
              💡 提示：任意用户名 + 密码 <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">password</code> 即可登录
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          还没有账号？{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
