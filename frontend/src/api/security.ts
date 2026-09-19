/**
 * Security capability map.
 *
 * Verified against backend/src/routes/auth.routes.ts: the API exposes
 * login, logout, and me only. There are no password-change, 2FA, session,
 * or account-deletion endpoints, so the Settings UI presents those areas
 * as explicit "not available" states instead of faking success.
 *
 * When the backend gains these operations, implement them here
 * (e.g. PATCH /auth/password) and flip the flags below.
 */

export const SECURITY_CAPABILITIES = {
  /** No PATCH /auth/password endpoint exists. */
  changePassword: false,
  /** No 2FA enrollment endpoints exist. */
  twoFactor: false,
  /** Sessions are stateless JWTs; no session list/revoke endpoints exist. */
  sessions: false,
  /** No DELETE /auth/account endpoint exists. */
  deleteAccount: false,
} as const;
