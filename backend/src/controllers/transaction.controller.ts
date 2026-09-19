import type { Request, Response } from 'express';
import type { ZodError } from 'zod';
import { AppError, asyncHandler } from '../utils/AppError';
import { exportQuerySchema } from '../validation/export.validation';
import { transactionQuerySchema } from '../validation/transaction.validation';
import { buildCsvContent, formatCsvCell } from '../utils/csv';
import {
  getExportDocuments,
  getNumericExportColumns,
  getTransactionById,
  isValidTransactionId,
  listTransactions,
} from '../services/transaction.service';

function formatZodIssues(error: ZodError): string {
  return `Validation failed: ${error.issues.map((i) => `${String(i.path.join('.')) || 'query'}: ${i.message}`).join('; ')}`;
}

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const parsed = transactionQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, formatZodIssues(parsed.error));
  }

  const result = await listTransactions(parsed.data);
  res.status(200).json(result);
});

export const getTransaction = asyncHandler(async (req: Request, res: Response) => {
  const rawId = String(req.params.id ?? '').trim();
  if (!rawId || !isValidTransactionId(rawId)) {
    throw new AppError(400, 'Invalid transaction id');
  }

  const doc = await getTransactionById(rawId);
  if (!doc) {
    throw new AppError(404, 'Transaction not found');
  }

  res.status(200).json({ data: doc });
});

/**
 * CSV export of ALL records matching the caller's filters/search/sort —
 * every page, never just the requested table page (there is no page/limit
 * here by design). Same filter semantics as the list endpoint, restricted
 * to the whitelisted export columns.
 */
export const exportTransactions = asyncHandler(async (req: Request, res: Response) => {
  const parsed = exportQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, formatZodIssues(parsed.error));
  }

  const { columns, ...filters } = parsed.data;
  const docs = await getExportDocuments(columns, filters);
  const numericColumns = getNumericExportColumns();
  const rows = docs.map((doc) => columns.map((column) => formatCsvCell(column, numericColumns, doc[column])));
  const csv = buildCsvContent([...columns], rows);

  const stamp = new Date().toISOString().slice(0, 10);
  res
    .status(200)
    .set('Content-Type', 'text/csv; charset=utf-8')
    .set('Content-Disposition', `attachment; filename="financial-transactions-${stamp}.csv"`)
    .send(csv);
});
