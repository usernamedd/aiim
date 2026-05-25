// Page: P02 注册页
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/C07-Button/Button';
import { Input } from '../../components/C08-Input/Input';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    username: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    clearError();
    setLocalError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (form.password.length < 6) {
      setLocalError('密码至少6位');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('两次密码不一致');
      return;
    }

    try {
      await register({
        username: form.username,
        password: form.password,
        nickname: form.nickname || form.username,
        email: form.email || undefined,
      });
      navigate('/home');
    } catch {
      // error is set in store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AIIM</h1>
          <p className="text-slate-400">创建你的账号</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">注册</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="用户名"
              placeholder="请输入用户名"
              value={form.username}
              onChange={handleChange('username')}
              required
            />

            <Input
              label="昵称"
              placeholder="请输入昵称（可选）"
              value={form.nickname}
              onChange={handleChange('nickname')}
            />

            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱（可选）"
              value={form.email}
              onChange={handleChange('email')}
            />

            <Input
              label="密码"
              type="password"
              placeholder="请输入密码（至少6位）"
              value={form.password}
              onChange={handleChange('password')}
              required
            />

            <Input
              label="确认密码"
              type="password"
              placeholder="请再次输入密码"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
            />

            {displayError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {displayError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              注册
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">已有账号？</span>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 ml-1">
              返回登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
