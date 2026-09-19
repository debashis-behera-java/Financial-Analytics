import jwt from 'jsonwebtoken';
import type { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../models/User';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/**
 * Single place for all JWT operations. Secrets/expiry come only from
 * environment variables (see config/env.ts). Nothing is hardcoded here.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  const { sub, email, role } = decoded as JwtPayload & Partial<AccessTokenPayload>;
  if (typeof sub !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
    throw new jwt.JsonWebTokenError('Token payload is malformed');
  }
  return { sub, email, role: role as UserRole };
}

export { jwt };
