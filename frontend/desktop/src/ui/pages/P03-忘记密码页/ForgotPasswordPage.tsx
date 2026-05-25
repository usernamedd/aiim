// Page: P03 忘记密码页
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/C07-Button/Button';
import { Input } from '../../components/C08-Input/Input';
import { useToast } from '../../components/C03-Toast/Toast';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      showToast('请输入有效邮箱', 'error');
      return;
    }
    setIsLoading(true);
    // Mock: simulate sending code
    await new Promise((r) => setTimeout(r, 1000));
    showToast('验证码已发送到邮箱', 'success');
    setStep('reset');
    setIsLoading(false);
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      showToast('请输入6位验证码', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('密码至少6位', 'error');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    showToast('密码重置成功', 'success');
    setStep('done');
    setIsLoading(false);
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">密码重置成功</h2>
            <p className="text-slate-500 mb-6">请使用新密码登录</p>
            <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/login')}>
              返回登录
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AIIM</h1>
          <p className="text-slate-400">重置密码</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">输入注册邮箱</h2>
              <Input
                label="邮箱"
                type="email"
                placeholder="请输入注册邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                发送验证码
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">设置新密码</h2>
              <p className="text-sm text-slate-500">验证码已发送到 <span className="font-medium">{email}</span></p>
              <Input
                label="验证码"
                placeholder="请输入6位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
              <Input
                label="新密码"
                type="password"
                placeholder="请输入新密码（至少6位）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep('email')}>
                ← 重新输入邮箱
              </Button>
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                重置密码
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-slate-500">想起密码了？</span>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 ml-1">返回登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
