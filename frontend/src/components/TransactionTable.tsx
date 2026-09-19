import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { formatCurrency, formatDate } from '../utils/format';
import { glassControl } from '../lib/glass';
import type { SortableField, SortOrder, Transaction } from '../types/transaction';

interface Column {
  field: SortableField | 'user_profile' | 'actions';
  label: string;
  sortable: boolean;
  align?: 'left' | 'center';
  width?: number;
}

const COLUMNS: Column[] = [
  { field: 'id', label: 'ID', sortable: true, align: 'left', width: 72 },
  { field: 'date', label: 'Date', sortable: true, align: 'left', width: 128 },
  { field: 'amount', label: 'Amount', sortable: true, align: 'left', width: 132 },
  { field: 'category', label: 'Category', sortable: true, align: 'left', width: 128 },
  { field: 'status', label: 'Status', sortable: true, align: 'left', width: 124 },
  { field: 'user_id', label: 'User ID', sortable: true, align: 'left', width: 112 },
  { field: 'user_profile', label: 'User Profile', sortable: false, align: 'left' },
  { field: 'actions', label: 'Actions', sortable: false, align: 'center', width: 72 },
];

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Clipboard copy with a legacy fallback for non-secure contexts. */
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fall through to the legacy path below.
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

function statusChipSx(status: string) {
  if (status === 'Paid') {
    return {
      bgcolor: '#dcfce7',
      color: '#15803d',
      border: '1px solid #bbf7d0',
    };
  }
  if (status === 'Pending') {
    return {
      bgcolor: '#fef3c7',
      color: '#b45309',
      border: '1px solid #fde68a',
    };
  }
  return {
    bgcolor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  };
}

interface TransactionTableProps {
  rows: Transaction[];
  sortBy: SortableField;
  sortOrder: SortOrder;
  onSortChange: (field: SortableField) => void;
}

function renderCategory(value: string) {
  const isExpense = value.toLowerCase() === 'expense';
  const Icon = isExpense ? RestaurantIcon : TrendingUpIcon;
  const color = isExpense ? '#ea8600' : '#16a34a';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Icon sx={{ fontSize: 16, color, flexShrink: 0 }} aria-hidden="true" />
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </Box>
    </Box>
  );
}

function renderUserProfile(value: string) {
  if (isHttpUrl(value)) {
    return (
      <Link
        href={value}
        target="_blank"
        rel="noreferrer"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          maxWidth: 230,
          verticalAlign: 'bottom',
          fontWeight: 500,
        }}
        title={value}
      >
        <Box
          component="span"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
        >
          {value}
        </Box>
        <OpenInNewIcon sx={{ fontSize: 12, flexShrink: 0 }} aria-hidden="true" />
      </Link>
    );
  }
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        maxWidth: 220,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'text.secondary',
      }}
      title={value}
    >
      {value}
    </Box>
  );
}

/**
 * Presentation-only table. Sorting is server-side: header clicks only
 * report the requested field upward; rows are rendered exactly as returned.
 * Fixed table layout + uniform alignment keeps every column's start
 * position identical across header and all rows. The Actions column offers
 * only real client-side utilities (copy / open) — no backend involved.
 */
export function TransactionTable({ rows, sortBy, sortOrder, onSortChange }: TransactionTableProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuTx, setMenuTx] = useState<Transaction | null>(null);

  function openMenu(e: React.MouseEvent<HTMLElement>, tx: Transaction): void {
    setMenuAnchor(e.currentTarget);
    setMenuTx(tx);
  }

  function closeMenu(): void {
    setMenuAnchor(null);
    setMenuTx(null);
  }

  async function handleCopy(text: string): Promise<void> {
    await copyText(text);
    closeMenu();
  }

  function handleOpenProfile(): void {
    if (menuTx && isHttpUrl(menuTx.user_profile)) {
      window.open(menuTx.user_profile, '_blank', 'noreferrer');
    }
    closeMenu();
  }

  return (
    <>
    <TableContainer
      sx={{
        ...glassControl,
        overflowX: 'auto',
        borderRadius: 2,
        borderColor: 'rgba(230, 234, 240, 0.8)',
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 8 },
      }}
    >
      <Table
        stickyHeader
        size="small"
        aria-label="Transactions"
        sx={{ tableLayout: 'fixed', minWidth: 960, width: '100%' }}
      >
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell
                key={col.field}
                align={col.align ?? 'left'}
                sx={{
                  width: col.width,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  ...(col.align === 'center' ? { textAlign: 'center' } : null),
                }}
              >
                {col.sortable ? (
                  <TableSortLabel
                    active={sortBy === col.field}
                    direction={sortBy === col.field ? sortOrder : 'asc'}
                    onClick={() => onSortChange(col.field as SortableField)}
                    aria-label={`Sort by ${col.label}`}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((tx) => (
            <TableRow key={tx.id} hover sx={{ height: 48 }}>
              <TableCell
                align="left"
                sx={{ whiteSpace: 'nowrap', verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}
              >
                {tx.id}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{formatDate(tx.date)}</TableCell>
              <TableCell
                align="left"
                sx={{ whiteSpace: 'nowrap', verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums', fontWeight: 650 }}
              >
                {formatCurrency(tx.amount)}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle' }}>
                {renderCategory(tx.category)}
              </TableCell>
              <TableCell align="left" sx={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                <Chip label={tx.status} size="small" sx={{ minWidth: 72, ...statusChipSx(tx.status) }} />
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  verticalAlign: 'middle',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {tx.user_id}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle' }}>
                {renderUserProfile(tx.user_profile)}
              </TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                <IconButton
                  size="small"
                  onClick={(e) => openMenu(e, tx)}
                  aria-label={`Row actions for transaction ${tx.id}`}
                  aria-haspopup="menu"
                  sx={{ color: 'text.secondary' }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Menu
      anchorEl={menuAnchor}
      open={menuAnchor !== null && menuTx !== null}
      onClose={closeMenu}
      aria-label={menuTx ? `Actions for transaction ${menuTx.id}` : 'Row actions'}
    >
      <MenuItem onClick={() => menuTx && void handleCopy(String(menuTx.id))} aria-label="Copy transaction ID">
        <ListItemIcon>
          <ContentCopyIcon fontSize="small" />
        </ListItemIcon>
        Copy transaction ID
      </MenuItem>
      <MenuItem onClick={() => menuTx && void handleCopy(menuTx.user_id)} aria-label="Copy user ID">
        <ListItemIcon>
          <ContentCopyIcon fontSize="small" />
        </ListItemIcon>
        Copy user ID
      </MenuItem>
      <MenuItem
        onClick={handleOpenProfile}
        disabled={!menuTx || !isHttpUrl(menuTx.user_profile)}
        aria-label="Open user profile in new tab"
      >
        <ListItemIcon>
          <OpenInNewIcon fontSize="small" />
        </ListItemIcon>
        Open profile link
      </MenuItem>
    </Menu>
    </>
  );
}
