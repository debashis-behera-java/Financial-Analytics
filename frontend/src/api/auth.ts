import { apiClient } from './client';
import type { LoginRequest, LoginResponse, MeResponse } from '../types/auth';

/** POST /api/auth/login — returns a Bearer token plus the safe user. */
export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return data;
}

/** GET /api/auth/me — resolves the stored token to the current user. */
export async function meApi(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/auth/me');
  return data;
}

/**
 * POST /api/auth/logout — best-effort. The backend is stateless, so this
 * only documents the contract; the client always discards the token itself.
 */
export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}
