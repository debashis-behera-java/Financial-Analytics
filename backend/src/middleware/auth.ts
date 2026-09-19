import type { NextFunction, Request, Response } from 'express';
import { User, toSafeUser } from '../models/User';
import type { SafeUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { verifyAccessToken, jwt } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: SafeUser;
}

/**
 * Bearer-token authentication middleware.
 * Reads `Authorization: Bearer <JWT>`, verifies it, loads the user from the
 * database (so deleted users lose access), and attaches a safe user object
 * (never the password hash) to the request.
 */
export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw new AppError(401, 'Authorization header is required');
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      throw new AppError(401, 'Authorization header must be in the format: Bearer <token>');
    }

    let payload;
    try {
      payload = verifyAccessToken(parts[1]);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Token has expired');
      }
      throw new AppError(401, 'Invalid token');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    req.user = toSafeUser(user);
    next();
  } catch (err) {
    next(err);
  }
}
