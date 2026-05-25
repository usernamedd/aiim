// Hook: useAuth
// UI layer hook — calls AuthService driving port

import { useCallback } from 'react';
import { useAuthStore } from '../../infrastructure/stores/auth-store';
import { authService } from '../../infrastructure/ioc/container';
import type { Credentials, RegisterParams } from '../../domain/value-objects';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, setUser, setToken, setLoading, setError, logout: clearAuth } = useAuthStore();

  const login = useCallback(async (credentials: Credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      setToken(result.token as any);
      setUser(result.user);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, setLoading, setError]);

  const register = useCallback(async (params: RegisterParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register(params);
      setToken(result.token as any);
      setUser(result.user);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, setLoading, setError]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError: () => setError(null),
  };
}
