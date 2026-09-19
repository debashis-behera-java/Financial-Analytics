import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { env } from '../config/env';
import type { AuthRequest } from '../middleware/auth';
import { User, toSafeUser } from '../models/User';
import { AppError, asyncHandler } from '../utils/AppError';
import { signAccessToken } from '../utils/jwt';
import { loginSchema } from '../validation/auth.validation';

/** Generic message: never reveals whether the email or password was wrong. */
const INVALID_CREDENTIALS = 'Invalid email or password';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      400,
      `Validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
    );
  }

  const { email, password } = parsed.data;

  // passwordHash is select:false, so explicitly include it for comparison only.
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  const token = signAccessToken({ sub: String(user._id), email: user.email, role: user.role });

  res.status(200).json({
    token,
    tokenType: 'Bearer',
    expiresIn: env.jwtExpiresIn,
    user: toSafeUser(user),
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  // requireAuth guarantees req.user is set.
  res.status(200).json({ user: req.user });
});

export const protectedTest = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: 'Protected route accessed successfully',
    user: req.user,
  });
});

/**
 * Logout for a stateless Bearer-JWT strategy.
 *
 * There is no server-side session or token revocation list, so the server
 * cannot invalidate an already-issued JWT. Logout means the client discards
 * the token (and the token naturally expires per JWT_EXPIRES_IN). This
 * endpoint exists so clients have a consistent logout call and to document
 * that contract explicitly.
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Logged out. Discard the access token on the client; it cannot be revoked server-side.',
  });
});
