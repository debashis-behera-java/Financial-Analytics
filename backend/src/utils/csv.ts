/**
 * Pure CSV generation helpers (no database, no Express).
 *
 * Rules:
 * - Fields containing `,"`, CR, or LF are wrapped in quotes with `"` doubled.
 * - String cells starting with a spreadsheet formula trigger (`=`, `+`, `-`,
 *   `@`, tab, CR) are prefixed with a single quote so Excel/Sheets will not
 *   evaluate them. Numeric cells pass through untouched so normal amounts are
 *   never corrupted.
 * - Output is UTF-8 with a BOM and CRLF line endings (Excel-friendly).
 */

const NEEDS_QUOTES = /[",\r\n]/;
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

export function sanitizeCsvStringCell(value: string): string {
  return FORMULA_TRIGGER.test(value) ? `'${value}` : value;
}

export function escapeCsvField(value: string): string {
  if (NEEDS_QUOTES.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format one pre-stringified cell. Numeric columns (id, amount) are never
 * formula-sanitized; everything else is treated as an untrusted string.
 */
export function formatCsvCell(column: string, numericColumns: ReadonlySet<string>, raw: unknown): string {
  if (raw === null || raw === undefined) {
    return '';
  }
  if (raw instanceof Date) {
    return escapeCsvField(raw.toISOString());
  }
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? String(raw) : '';
  }
  const text = String(raw);
  const safe = numericColumns.has(column) ? text : sanitizeCsvStringCell(text);
  return escapeCsvField(safe);
}

/** Build the full CSV document: BOM + header row + one row per record. */
export function buildCsvContent(headers: string[], rows: string[][]): string {
  const lines = [headers.map(escapeCsvField).join(',')];
  for (const row of rows) {
    lines.push(row.join(','));
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
