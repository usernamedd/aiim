// UI Layer: Root App Component with React Router
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from '../components/C03-Toast/Toast';
import { useAuthStore } from '../../infrastructure/stores/auth-store';
import { LoginPage } from '../pages/P01-登录页';
import { RegisterPage } from '../pages/P02-注册页';
import { ForgotPasswordPage } from '../pages/P03-忘记密码页';
import { HomePage } from '../pages/P10-主聊列表页/HomePage';
import { ChatPage } from '../pages/P20-私聊页/ChatPage';
import { GroupChatPage } from '../pages/P21-群聊页/GroupChatPage';
import { ContactsPage } from '../pages/P22-联系人列表页/ContactsPage';
import { SearchPage } from '../pages/P60-全局搜索页/SearchPage';
import { SearchResultsPage } from '../pages/P61-搜索结果页/SearchResultsPage';
import { SettingsPage } from '../pages/P50-个人设置页/SettingsPage';
import { SettingsDomainPage } from '../pages/P51-行业切换页/SettingsDomainPage';
import { FileBrowserPage } from '../pages/P30-文件浏览器页/FileBrowserPage';

// Auth Guard - redirects to login if not authenticated
function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Guest Guard - redirects to home if already logged in
function GuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest only routes */}
          <Route element={<GuestGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<AuthGuard />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat/:chatRoomId" element={<ChatPage />} />
            <Route path="/group/:chatRoomId" element={<GroupChatPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search/results" element={<SearchResultsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/domain" element={<SettingsDomainPage />} />
            <Route path="/files" element={<FileBrowserPage />} />
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}