import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

/**
 * Centralized API client.
 *
 * - Base URL comes only from VITE_API_URL (see .env / .env.example).
 * - The backend uses stateless Bearer JWTs, so the token is attached here
 *   from storage on every request — components never touch headers.
 * - A 401 from any endpoint other than login means the stored token is
 *   expired/invalid/revoked-by-deletion: the token is discarded and the
 *   auth layer is notified via SESSION_EXPIRED_EVENT (no navigation here,
 *   so routing stays in one place).
 */

const TOKEN_STORAGE_KEY = 'financial-analytics:access-token';
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Storage unavailable (private mode etc.) — session simply won't persist.
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors on cleanup.
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

function isLoginRequest(url: string | undefined): boolean {
  return url?.includes('/auth/login') ?? false;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      const url = error.config?.url;
      // A 401 from login itself is just "wrong credentials" — handled by
      // the login form, not by tearing down the session.
      if (!isLoginRequest(url)) {
        clearStoredToken();
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

interface BackendErrorBody {
  message?: unknown;
}

/** Extract a human-readable message from any API failure. */
export function toApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
    const data = error.response.data as BackendErrorBody | undefined;
    if (typeof data?.message === 'string' && data.message.length > 0) {
      return data.message;
    }
    return `Request failed with status ${error.response.status}.`;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
