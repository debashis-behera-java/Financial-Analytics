import type { Request, Response } from 'express';
import type { ZodError } from 'zod';
import { AppError, asyncHandler } from '../utils/AppError';
import { analyticsQuerySchema } from '../validation/analytics.validation';
import { getCategoryBreakdown, getRevenueExpense, getSummary } from '../services/analytics.service';

function formatZodIssues(error: ZodError): string {
  return `Validation failed: ${error.issues.map((i) => `${String(i.path.join('.')) || 'query'}: ${i.message}`).join('; ')}`;
}

function parseAnalyticsQuery(req: Request) {
  const parsed = analyticsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, formatZodIssues(parsed.error));
  }
  return parsed.data;
}

export const getSummaryHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await getSummary(parseAnalyticsQuery(req));
  res.status(200).json(result);
});

export const getRevenueExpenseHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getRevenueExpense(parseAnalyticsQuery(req));
  res.status(200).json({ data });
});

export const getCategoriesHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCategoryBreakdown(parseAnalyticsQuery(req));
  res.status(200).json({ data });
});
