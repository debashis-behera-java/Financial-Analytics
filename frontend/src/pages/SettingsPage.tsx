import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { useAuth } from '../hooks/useAuth';
import { exportTransactionsCsv } from '../api/transactions';
import { toApiErrorMessage } from '../api/client';
import { SECURITY_CAPABILITIES } from '../api/security';
import { downloadBlob } from '../utils/download';
import {
  APPEARANCE_PREF_KEY,
  CURRENCIES,
  DATE_FORMATS,
  DEFAULT_DISPLAY_PREFS,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_RANGES,
  DISPLAY_NAME_PREF_KEY,
  DISPLAY_PREFS_KEY,
  NOTIFICATION_PREFS_KEY,
  readPref,
  readThemeMode,
  writePref,
} from '../utils/localPrefs';
import type { DisplayPrefs, NotificationPrefs, ThemeModePref } from '../utils/localPrefs';
import { EXPORTABLE_COLUMNS } from '../types/transaction';

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ height: '100%', borderRadius: '24px' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #4F7CFF, #7C4DFF)',
                boxShadow: '0 8px 20px rgba(79,124,255,0.25)',
                color: 'common.white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {icon}
            </Box>
            {title}
          </Box>
        }
        subheader={subtitle}
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent sx={{ pt: 1 }}>{children}</CardContent>
    </Card>
  );
}

function Row({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 1.25,
        borderBottom: '1px solid rgba(230, 234, 240, 0.7)',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {hint}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Box>
  );
}

/** Settings center. Server-backed where APIs exist, device-local otherwise — never faked. */
export function SettingsPage() {
  const { user, logout } = useAuth();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Profile (display name is a device-local preference; identity comes from auth).
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(() =>
    readPref<string>(DISPLAY_NAME_PREF_KEY, user?.email.split('@')[0] ?? ''),
  );

  // Appearance + notifications + display preferences (device-local, persisted).
  const [themeMode, setThemeMode] = useState<ThemeModePref>(() => readThemeMode());
  const [notifications, setNotifications] = useState<NotificationPrefs>(() =>
    readPref<NotificationPrefs>(NOTIFICATION_PREFS_KEY, DEFAULT_NOTIFICATION_PREFS),
  );
  const [display, setDisplay] = useState<DisplayPrefs>(() =>
    readPref<DisplayPrefs>(DISPLAY_PREFS_KEY, DEFAULT_DISPLAY_PREFS),
  );

  // Security form (no backend endpoint — validated locally, honestly reported).
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Data export + delete dialog.
  const [isExporting, setIsExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAck, setDeleteAck] = useState(false);

  function notify(message: string, severity: 'success' | 'error' | 'info' = 'success'): void {
    setSnackbar({ open: true, message, severity });
  }

  function handleSaveProfile(): void {
    const trimmed = displayName.trim();
    if (trimmed.length === 0) {
      notify('Display name cannot be empty.', 'error');
      return;
    }
    writePref(DISPLAY_NAME_PREF_KEY, trimmed);
    setDisplayName(trimmed);
    setEditingProfile(false);
    notify('Display name saved on this device.');
  }

  function handleCancelProfile(): void {
    setDisplayName(readPref<string>(DISPLAY_NAME_PREF_KEY, user?.email.split('@')[0] ?? ''));
    setEditingProfile(false);
  }

  function handleThemeMode(mode: ThemeModePref): void {
    setThemeMode(mode);
    writePref(APPEARANCE_PREF_KEY, mode);
    if (mode !== 'light') {
      notify('Dark/System themes are planned — the app ships a light theme today.', 'info');
    }
  }

  function handleNotificationToggle(key: keyof NotificationPrefs, value: boolean): void {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    writePref(NOTIFICATION_PREFS_KEY, next);
  }

  function handleDisplayChange(patch: Partial<DisplayPrefs>): void {
    const next = { ...display, ...patch };
    setDisplay(next);
    writePref(DISPLAY_PREFS_KEY, next);
  }

  function handlePasswordSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // SECURITY_CAPABILITIES.changePassword is false: no endpoint to call.
    notify('Password change is not available in this version — no password API exists yet.', 'info');
  }

  async function handleExportData(): Promise<void> {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { blob, filename } = await exportTransactionsCsv(
        { sortBy: 'date', sortOrder: 'desc' },
        EXPORTABLE_COLUMNS.map((c) => c.field),
      );
      downloadBlob(blob, filename);
      notify('Financial data exported as CSV.');
    } catch (error) {
      notify(toApiErrorMessage(error, 'Export failed. Please try again.'), 'error');
    } finally {
      setIsExporting(false);
    }
  }

  const initial = (user?.email.trim().charAt(0).toUpperCase() || '?') as string;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your profile, appearance, notifications, security, and data preferences.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            icon={<PersonOutlinedIcon />}
            title="Profile"
            subtitle="Your signed-in identity. Email and role are managed by your administrator."
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#2563eb', fontSize: 22, fontWeight: 800 }} aria-hidden="true">
                {initial}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName || user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role === 'admin' ? 'Administrator' : 'Member'}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}
                />
              </Box>
            </Box>
            {editingProfile ? (
              <Box sx={{ mt: 1.5 }}>
                <TextField
                  label="Display name"
                  fullWidth
                  size="small"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  helperText="Stored on this device only."
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <Button variant="contained" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                  <Button variant="outlined" onClick={handleCancelProfile}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button variant="outlined" startIcon={<EditIcon fontSize="small" />} onClick={() => setEditingProfile(true)} sx={{ mt: 1 }}>
                Edit Profile
              </Button>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            icon={<PaletteOutlinedIcon />}
            title="Appearance"
            subtitle="Theme preference is saved on this device."
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Theme
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(['light', 'dark', 'system'] as ThemeModePref[]).map((mode) => (
                <Button
                  key={mode}
                  variant={themeMode === mode ? 'contained' : 'outlined'}
                  disabled={mode !== 'light'}
                  onClick={() => handleThemeMode(mode)}
                  aria-pressed={themeMode === mode}
                  sx={{ textTransform: 'capitalize' }}
                  title={mode === 'light' ? 'Light theme' : 'Planned — the app ships a light theme today'}
                >
                  {mode}
                </Button>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Dark and System themes are planned for a future theme engine.
            </Typography>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            icon={<NotificationsOutlinedIcon />}
            title="Notifications"
            subtitle="Toggles take effect immediately and persist on this device."
          >
            <Row
              label="Email notifications"
              hint="Product updates and summaries."
              control={
                <Switch
                  checked={notifications.email}
                  onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                  aria-label="Email notifications"
                />
              }
            />
            <Row
              label="Transaction alerts"
              hint="Large or unusual transaction activity."
              control={
                <Switch
                  checked={notifications.transactionAlerts}
                  onChange={(e) => handleNotificationToggle('transactionAlerts', e.target.checked)}
                  aria-label="Transaction alerts"
                />
              }
            />
            <Row
              label="Financial insights"
              hint="Weekly spending patterns and tips."
              control={
                <Switch
                  checked={notifications.insights}
                  onChange={(e) => handleNotificationToggle('insights', e.target.checked)}
                  aria-label="Financial insights"
                />
              }
            />
            <Row
              label="Security alerts"
              hint="Sign-ins and protective notices."
              control={
                <Switch
                  checked={notifications.security}
                  onChange={(e) => handleNotificationToggle('security', e.target.checked)}
                  aria-label="Security alerts"
                />
              }
            />
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            icon={<LockOutlinedIcon />}
            title="Security"
            subtitle="Protect access to your account."
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Change password
            </Typography>
            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                label="Current password"
                type="password"
                size="small"
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <TextField
                label="New password"
                type="password"
                size="small"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                helperText="At least 8 characters."
              />
              <TextField
                label="Confirm new password"
                type="password"
                size="small"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {passwordError && <Alert severity="error">{passwordError}</Alert>}
              <Box>
                <Button type="submit" variant="outlined">
                  Update Password
                </Button>
              </Box>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              Password changes are not connected yet — the backend exposes no password endpoint in this version.
            </Alert>
            <Row
              label="Two-factor authentication"
              hint={SECURITY_CAPABILITIES.twoFactor ? undefined : 'Not available in this version.'}
              control={<Chip label="Not enabled" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700 }} />}
            />
            <Row
              label="Active sessions"
              hint="This device · signed in as your account."
              control={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LogoutIcon fontSize="small" />}
                  onClick={() => void logout()}
                >
                  Sign Out
                </Button>
              }
            />
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            icon={<PrivacyTipOutlinedIcon />}
            title="Data & Privacy"
            subtitle="Your data stays yours. Destructive actions always confirm first."
          >
            <Row
              label="Export my financial data"
              hint="Downloads every recorded transaction as CSV."
              control={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon fontSize="small" />}
                  onClick={() => void handleExportData()}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting…' : 'Export CSV'}
                </Button>
              }
            />
            <Row
              label="Delete account"
              hint="Permanent. Requires administrator action."
              control={
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon fontSize="small" />}
                  onClick={() => {
                    setDeleteAck(false);
                    setDeleteOpen(true);
                  }}
                >
                  Delete…
                </Button>
              }
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Privacy: analytics are computed from your own records on your own server. Nothing is shared externally by this app.
            </Typography>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            icon={<TuneOutlinedIcon />}
            title="Preferences"
            subtitle="Display preferences saved on this device. Amounts always originate in USD."
          >
            <TextField
              label="Currency"
              select
              fullWidth
              size="small"
              value={display.currency}
              onChange={(e) => handleDisplayChange({ currency: e.target.value })}
              sx={{ mt: 1 }}
            >
              {CURRENCIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date format"
              select
              fullWidth
              size="small"
              value={display.dateFormat}
              onChange={(e) => handleDisplayChange({ dateFormat: e.target.value })}
              sx={{ mt: 2 }}
            >
              {DATE_FORMATS.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Default dashboard range"
              select
              fullWidth
              size="small"
              value={display.defaultRange}
              onChange={(e) => handleDisplayChange({ defaultRange: e.target.value })}
              sx={{ mt: 2 }}
            >
              {DEFAULT_RANGES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} aria-labelledby="delete-account-title">
        <DialogTitle id="delete-account-title">Delete account?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Account deletion is permanent and cannot be undone. This version has no self-service deletion
            endpoint, so nothing will be deleted here — contact your administrator to proceed.
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={deleteAck} onChange={(e) => setDeleteAck(e.target.checked)} />}
            label="I understand this cannot be undone"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deleteAck}
            onClick={() => {
              setDeleteOpen(false);
              notify('Account deletion is not available — please contact your administrator.', 'info');
            }}
          >
            Request Deletion
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
