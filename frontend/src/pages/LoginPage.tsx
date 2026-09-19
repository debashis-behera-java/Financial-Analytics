import { useState } from 'react';
import type { FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { status, error, login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const emailError = touched && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address.' : null;
  const passwordError = touched && password.length === 0 ? 'Password is required.' : null;
  const canSubmit = EMAIL_PATTERN.test(email.trim()) && password.length > 0 && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTouched(true);
    if (!EMAIL_PATTERN.test(email.trim()) || password.length === 0 || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        navigate(from, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
        py: 5,
        background:
          'radial-gradient(circle at 8% 12%, rgba(147,197,253,0.40), transparent 46%),' +
          'radial-gradient(circle at 92% 10%, rgba(196,181,253,0.42), transparent 46%),' +
          'radial-gradient(circle at 50% 105%, rgba(165,180,252,0.30), transparent 52%),' +
          'linear-gradient(120deg, #dfe9fb 0%, #eef1fb 38%, #f2efff 72%, #e9e7fb 100%)',
        '@keyframes loginEnter': {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(100,116,139,0.07) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(100,116,139,0.07) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(ellipse at 50% 42%, black 20%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 42%, black 20%, transparent 78%)',
        }}
      />
      <Box
        component="svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', display: { xs: 'none', md: 'block' } }}
      >
        <g opacity="0.7">
          {[
            { x: 80, o: 150, c: 26, up: true }, { x: 112, o: 195, c: 34, up: false },
            { x: 144, o: 128, c: 22, up: true }, { x: 176, o: 215, c: 40, up: true },
            { x: 1290, o: 150, c: 28, up: false }, { x: 1322, o: 195, c: 36, up: true },
            { x: 1354, o: 130, c: 24, up: true }, { x: 1386, o: 210, c: 38, up: false },
          ].map((c, i) => (
            <g key={i}>
              <line x1={c.x} y1={c.o - c.c} x2={c.x} y2={c.o + c.c} stroke={c.up ? 'rgba(37,99,235,0.16)' : 'rgba(124,58,237,0.16)'} strokeWidth="2" />
              <rect x={c.x - 7} y={c.o - c.c * 0.45} width={14} height={c.c * 0.9} rx={3} fill={c.up ? 'rgba(37,99,235,0.10)' : 'rgba(124,58,237,0.10)'} />
            </g>
          ))}
        </g>
        <path
          d="M-20,220 C220,180 420,240 700,195 C980,150 1220,215 1460,175"
          fill="none"
          stroke="rgba(139,92,246,0.14)"
          strokeWidth="1.5"
        />
        <path
          d="M-20,660 C220,615 420,675 700,625 C980,575 1220,645 1460,600"
          fill="none"
          stroke="rgba(79,124,255,0.16)"
          strokeWidth="2"
        />
        <circle cx="700" cy="625" r="4" fill="#ffffff" stroke="rgba(79,124,255,0.30)" strokeWidth="2" />
        <circle cx="1120" cy="598" r="4" fill="#ffffff" stroke="rgba(124,58,237,0.30)" strokeWidth="2" />
        <g opacity="0.8">
          {[52, 78, 64, 98, 82, 116, 100, 60].map((h, i) => (
            <rect
              key={i}
              x={70 + i * 52}
              y={880 - h}
              width={26}
              height={h}
              rx={6}
              fill={i % 2 === 0 ? 'rgba(37,99,235,0.10)' : 'rgba(124,58,237,0.10)'}
            />
          ))}
          {[60, 88, 72, 106, 90, 70, 96].map((h, i) => (
            <rect
              key={i}
              x={1000 + i * 52}
              y={880 - h}
              width={26}
              height={h}
              rx={6}
              fill={i % 2 === 0 ? 'rgba(37,99,235,0.10)' : 'rgba(124,58,237,0.10)'}
            />
          ))}
        </g>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          width: { xs: 'calc(100vw - 32px)', sm: 540 },
          maxWidth: 'calc(100vw - 32px)',
          animation: 'loginEnter 450ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 20,
            width: '100%',
            borderRadius: '26px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f7faff 100%)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow:
              '0 30px 80px rgba(50,70,140,0.18), 0 2px 8px rgba(50,70,140,0.08), inset 0 1px 0 rgba(255, 255, 255, 1)',
            px: { xs: 3, sm: 5 },
            py: { xs: 3.5, sm: 4.5 },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 30 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 52%, #7c3aed 100%)',
                  color: 'common.white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  outline: '3px solid rgba(99, 102, 241, 0.18)',
                  outlineOffset: 3,
                  boxShadow: '0 12px 30px rgba(79,70,229,0.42), inset 0 1px 0 rgba(255,255,255,0.45)',
                }}
                aria-hidden="true"
              >
                <AccountBalanceWalletIcon fontSize="medium" />
              </Box>
              <Typography component="div" sx={{ fontSize: { xs: 26, sm: 30 }, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Financial Analytics
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', mt: 0.75 }}>
                Smart insights for better financial decisions.
              </Typography>
            </Box>

            <Typography component="h1" sx={{ fontSize: { xs: 28, sm: 32 }, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Welcome{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                back
              </Box>
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: '#64748b', mt: 0.75, mb: 3 }}>
              Sign in to continue to your financial dashboard.
            </Typography>

            {status === 'loading' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress aria-label="Checking session" />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} role="alert">
                    {error}
                  </Alert>
                )}

                <TextField
                  id="login-email"
                  label="Email address"
                  placeholder="Enter your email"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  required
                  value={email}
                  disabled={submitting}
                  error={emailError !== null}
                  helperText={emailError ?? undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} aria-hidden="true" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      minHeight: 56,
                      borderRadius: '14px',
                      backgroundColor: '#ffffff',
                      transition: 'box-shadow 180ms ease, border-color 180ms ease',
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)' },
                    },
                  }}
                />

                <TextField
                  id="login-password"
                  label="Password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  fullWidth
                  required
                  value={password}
                  disabled={submitting}
                  error={passwordError !== null}
                  helperText={passwordError ?? undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} aria-hidden="true" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword((v) => !v)}
                            edge="end"
                            disabled={submitting}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: 56,
                      borderRadius: '14px',
                      backgroundColor: '#ffffff',
                      transition: 'box-shadow 180ms ease, border-color 180ms ease',
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)' },
                    },
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 0.5, mt: 1.5, mb: 2 }}>
                  <Tooltip title="Sessions always stay signed in on this device">
                    <FormControlLabel
                      control={<Checkbox checked disabled size="small" sx={{ py: 0.5, color: '#94a3b8' }} />}
                      label="Remember me"
                      sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem', color: '#94a3b8' } }}
                    />
                  </Tooltip>
                  <Tooltip title="Password resets are not available in this demo — contact your administrator">
                    <span>
                      <Link
                        component="button"
                        type="button"
                        disabled
                        aria-label="Forgot password (not available)"
                        sx={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'not-allowed' }}
                      >
                        Forgot password?
                      </Link>
                    </span>
                  </Tooltip>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!canSubmit}
                  endIcon={!submitting ? <ArrowForwardIcon fontSize="small" /> : undefined}
                  sx={{
                    height: 56,
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'common.white',
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    boxShadow: '0 10px 28px rgba(79,70,229,0.35)',
                    transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      filter: 'brightness(1.08)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 14px 32px rgba(79,70,229,0.42)',
                    },
                    '&:active': { transform: 'translateY(0) scale(0.99)' },
                    '&.Mui-disabled': {
                      background: 'rgba(15, 23, 42, 0.08)',
                      backgroundImage: 'none',
                      color: 'rgba(15, 23, 42, 0.38)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'common.white' }} aria-label="Signing in" />
                      Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    fontSize: '0.75rem',
                    color: '#64748b',
                    mt: 2.5,
                  }}
                >
                  <LockOutlinedIcon sx={{ fontSize: 13 }} aria-hidden="true" />
                  Secure access • Your financial data is protected
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mt: 2.5,
            mx: 'auto',
            width: 'fit-content',
            maxWidth: '100%',
            px: 2,
            py: 0.75,
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 4px 14px rgba(51, 65, 120, 0.10)',
          }}
          aria-label="Demo environment notice"
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16a34a', flexShrink: 0 }} aria-hidden="true" />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Local demo environment · Use your seeded demo credentials
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
