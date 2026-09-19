export type UserRole = 'user' | 'admin';

/** Mirrors the backend SafeUser shape (never includes a password hash). */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Backend POST /api/auth/login response contract. */
export interface LoginResponse {
  token: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
}

/** Backend GET /api/auth/me response contract. */
export interface MeResponse {
  user: AuthUser;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** Last authentication error message for UI feedback (null when none). */
  error: string | null;
}
