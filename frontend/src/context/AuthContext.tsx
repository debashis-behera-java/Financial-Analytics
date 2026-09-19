import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AxiosError } from 'axios';
import {
  SESSION_EXPIRED_EVENT,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  toApiErrorMessage,
} from '../api/client';
import { loginApi, logoutApi, meApi } from '../api/auth';
import type { AuthState } from '../types/auth';

interface AuthContextValue extends AuthState {
  /** Authenticate with email + password. Throws nothing; error lands in state. */
  login: (email: string, password: string) => Promise<boolean>;
  /** Best-effort server logout, then always clears local session. */
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };
export type { AuthContextValue };

function mapLoginError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
    if (error.response.status === 401) {
      return 'Invalid email or password.';
    }
  }
  return toApiErrorMessage(error, 'Login failed. Please try again.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    error: null,
  });

  const restoreSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setState({ status: 'unauthenticated', user: null, error: null });
      return;
    }
    try {
      const { user } = await meApi();
      setState({ status: 'authenticated', user, error: null });
    } catch {
      // Token expired/invalid (interceptor already cleared storage).
      clearStoredToken();
      setState({ status: 'unauthenticated', user: null, error: null });
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // A 401 from any authenticated request (e.g. expired token mid-session)
  // drops back to the login screen without leaving stale React state.
  useEffect(() => {
    const handleExpired = () => {
      setState({ status: 'unauthenticated', user: null, error: 'Your session has expired. Please sign in again.' });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const { token, user } = await loginApi({ email, password });
      setStoredToken(token);
      setState({ status: 'authenticated', user, error: null });
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'unauthenticated',
        user: null,
        error: mapLoginError(error),
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // Server logout is best-effort; local cleanup always runs.
    }
    clearStoredToken();
    setState({ status: 'unauthenticated', user: null, error: null });
  }, []);

  const clearError = useCallback((): void => {
    setState((prev) => (prev.error === null ? prev : { ...prev, error: null }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, clearError }),
    [state, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
