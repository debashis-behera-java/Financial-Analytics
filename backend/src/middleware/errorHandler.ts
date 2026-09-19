import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'Route not found'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err instanceof AppError ? err.status : 500;
  const message =
    err instanceof Error ? err.message : 'Internal server error';

  if (status === 500 && process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(status).json({
    message: status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    status,
  });
}
