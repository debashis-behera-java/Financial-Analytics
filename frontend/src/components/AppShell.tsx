import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useAuth } from '../hooks/useAuth';
import { useRevenueExpense } from '../hooks/useAnalytics';
import { GLASS_PAGE_BACKGROUND } from '../lib/theme';
import { AmbientBackground } from './AmbientBackground';
import { dispatchGlobalSearch } from '../utils/globalSearch';

const SIDEBAR_WIDTH = 250;

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', hash: '#top', icon: <HomeIcon fontSize="small" /> },
  { label: 'Analytics', to: '/', hash: '#analytics', icon: <BarChartIcon fontSize="small" /> },
  { label: 'Transactions', to: '/', hash: '#transactions', icon: <ReceiptLongIcon fontSize="small" /> },
];

/** Real routes — fully functional pages, no badges. */
const SECONDARY_ITEMS = [
  { label: 'Settings', to: '/settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
  { label: 'Help & Support', to: '/help', icon: <HelpOutlinedIcon fontSize="small" /> },
];

function userInitial(email: string | undefined): string {
  if (!email) return '?';
  const initial = email.trim().charAt(0).toUpperCase();
  return initial === '' ? '?' : initial;
}

/** "Jan 1, 2024 – Dec 31, 2024" derived from real recorded months. */
function formatRecordedRange(periods: string[]): string | null {
  if (periods.length === 0) return null;
  const sorted = [...periods].sort();
  const parse = (p: string): [number, number] => {
    const [y, m] = (p as string).split('-').map(Number);
    return [y as number, m as number];
  };
  const [startYear, startMonth] = parse(sorted[0] as string);
  const [endYear, endMonth] = parse(sorted[sorted.length - 1] as string);
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const start = fmt.format(new Date(Date.UTC(startYear, startMonth - 1, 1)));
  const end = fmt.format(new Date(Date.UTC(endYear, endMonth, 0)));
  return `${start} – ${end}`;
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { data: trendData } = useRevenueExpense();
  const recordedRange = formatRecordedRange((trendData?.data ?? []).map((p) => p.period));
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [bellAnchor, setBellAnchor] = useState<HTMLElement | null>(null);
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
  const globalSearchRef = useRef<HTMLInputElement>(null);

  // Ctrl+K focuses the header search (real shortcut, real target).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        globalSearchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function handleLogout(): Promise<void> {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  function handleMenuClick(): void {
    if (isDesktop) {
      setCollapsed((v) => !v);
    } else {
      setMobileOpen(true);
    }
  }

  const location = useLocation();

  /** Route-derived selection so /settings and /help highlight like Dashboard does. */
  const selectedItem =
    location.pathname === '/settings'
      ? 'Settings'
      : location.pathname === '/help'
        ? 'Help & Support'
        : activeItem;

  function scrollToHash(hash: string): void {
    requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNavClick(item: { label: string; to: string; hash?: string }): void {
    setActiveItem(item.label);
    setMobileOpen(false);
    if (item.hash) {
      if (location.pathname !== '/') {
        navigate('/');
        window.setTimeout(() => scrollToHash(item.hash as string), 120);
      } else {
        scrollToHash(item.hash);
      }
      return;
    }
    if (location.pathname !== item.to) {
      navigate(item.to);
    }
  }

  function handleGlobalSearchSubmit(e: React.FormEvent): void {
    e.preventDefault();
    dispatchGlobalSearch(globalQuery);
  }

  /** Shared premium nav styling — primary and secondary items look identical. */
  function navButtonSx(active: boolean): Record<string, unknown> {
    return {
      justifyContent: 'flex-start',
      minHeight: 48,
      borderRadius: '16px',
      px: 2,
      width: '100%',
      color: active ? '#2563eb' : '#475569',
      bgcolor: active ? 'rgba(255,255,255,0.72)' : 'transparent',
      border: active ? '1px solid rgba(255,255,255,0.8)' : '1px solid transparent',
      fontWeight: active ? 700 : 600,
      boxShadow: active ? '0 8px 24px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.8)' : 'none',
      transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
      '& .MuiButton-startIcon': {
        color: active ? '#2563eb' : '#475569',
        transition: 'color 180ms cubic-bezier(0.4,0,0.2,1)',
      },
      '&:hover': {
        bgcolor: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)',
        transform: 'translateX(2px)',
      },
      '&:hover .MuiButton-startIcon': { color: '#2563eb' },
    };
  }

  const sidebarBody = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 2.25,
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5, pt: 0.5, pb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 8px 24px rgba(37,99,235,0.30)',
            transform: 'translateY(-1px)',
          }}
          aria-hidden="true"
        >
          <AccountBalanceWalletIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: '#0f172a',
            }}
          >
            Financial Analytics
          </Typography>
          <Typography sx={{ display: 'block', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
            Insights for a smarter tomorrow
          </Typography>
        </Box>
      </Box>
      <Box component="nav" aria-label="Dashboard sections" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {NAV_ITEMS.map((item) => {
          const active = selectedItem === item.label;
          return (
            <Button
              key={item.label}
              startIcon={item.icon}
              onClick={() => handleNavClick(item)}
              aria-current={active ? 'page' : undefined}
              sx={navButtonSx(active)}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>
      <Box
        aria-hidden="true"
        sx={{
          height: '1px',
          my: 2.25,
          background: 'linear-gradient(90deg, transparent, rgba(100,116,139,0.18), transparent)',
          flexShrink: 0,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }} aria-label="More sections">
        {SECONDARY_ITEMS.map((item) => {
          const active = selectedItem === item.label;
          return (
            <Button
              key={item.label}
              startIcon={item.icon}
              onClick={() => handleNavClick(item)}
              aria-current={active ? 'page' : undefined}
              sx={navButtonSx(active)}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 16 }} />
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          p: 2.5,
          background:
            'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.20), transparent 35%),' +
            'linear-gradient(145deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
          color: 'common.white',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 20px 45px rgba(79,70,229,0.30)',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-60%',
            left: '-30%',
            width: '60%',
            height: '220%',
            background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.14), transparent)',
            transform: 'rotate(8deg)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: 42,
            height: 42,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.30)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
            boxShadow: '0 0 20px rgba(255,255,255,0.25)',
          }}
          aria-hidden="true"
        >
          <AutoAwesomeIcon fontSize="small" sx={{ color: '#fef9c3' }} />
        </Box>
        <Typography sx={{ position: 'relative', zIndex: 1, fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
          Take control of your finances
        </Typography>
        <Typography sx={{ position: 'relative', zIndex: 1, mt: 0.75, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
          Make better decisions with powerful insights.
        </Typography>
        <Tooltip title="Upgrade is not available in the local demo">
          <span style={{ display: 'block', marginTop: 16, position: 'relative', zIndex: 1 }}>
            <Button
              variant="contained"
              disabled
              fullWidth
              sx={{
                height: 46,
                borderRadius: '14px',
                bgcolor: 'rgba(255,255,255,0.94)',
                color: '#2563eb',
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
                transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                '& .MuiButton-endIcon': { transition: 'transform 180ms cubic-bezier(0.4,0,0.2,1)' },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 25px rgba(15,23,42,0.18)',
                },
                '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)' },
                '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.94)', color: '#2563eb' },
              }}
            >
              Upgrade Plan →
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );

  const sidebarVisible = isDesktop && !collapsed;

  return (
    <Box sx={{ minHeight: '100vh', background: GLASS_PAGE_BACKGROUND, position: 'relative' }}>
      <AmbientBackground />
      {!isDesktop && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          slotProps={{
            paper: {
              sx: {
                width: SIDEBAR_WIDTH,
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
              },
            },
          }}
          aria-label="Navigation menu"
        >
          {sidebarBody}
        </Drawer>
      )}
      <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
        {sidebarVisible && (
          <Box
            component="aside"
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              height: 'calc(100vh - 32px)',
              width: { md: 220, lg: 250 },
              flexShrink: 0,
              zIndex: 1000,
              borderRadius: '28px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.62), rgba(230,240,255,0.38))',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow:
                '0 20px 60px rgba(51, 65, 120, 0.12),' +
                'inset 0 1px 0 rgba(255,255,255,0.9),' +
                'inset 0 0 0 1px rgba(255,255,255,0.25)',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -100,
                left: -80,
                width: 240,
                height: 320,
                background: 'radial-gradient(circle, rgba(96,165,250,0.28), transparent 70%)',
                filter: 'blur(25px)',
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -120,
                right: -90,
                width: 260,
                height: 300,
                background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              },
            }}
          >
            {sidebarBody}
          </Box>
        )}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            ml: sidebarVisible ? { xs: 0, md: '252px', lg: '282px' } : 0,
            transition: 'margin 220ms ease',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 16,
              zIndex: (t) => t.zIndex.appBar,
              mx: { xs: 2, md: 3 },
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.62), rgba(235,242,255,0.42))',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.78)',
              boxShadow:
                '0 12px 40px rgba(67, 87, 160, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.80)',
            }}
          >
            <Toolbar sx={{ gap: 2, flexWrap: 'wrap', px: { xs: 2, md: 2.5 }, py: 1.25 }}>
              <IconButton
                onClick={handleMenuClick}
                aria-label="Toggle navigation menu"
                edge={false}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '13px',
                  color: '#0f172a',
                  bgcolor: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.7)',
                  boxShadow: '0 2px 10px rgba(67, 87, 160, 0.08)',
                  transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': { bgcolor: 'rgba(219, 234, 254, 0.6)' },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                component="form"
                role="search"
                onSubmit={handleGlobalSearchSubmit}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1.25,
                  flexGrow: 1,
                  flexBasis: 220,
                  minHeight: 46,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(16px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                  boxShadow: '0 2px 10px rgba(67, 87, 160, 0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                  px: 2,
                  py: 0.5,
                  transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': { borderColor: 'rgba(191, 219, 254, 0.9)' },
                  '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' },
                }}
              >
                <SearchIcon fontSize="small" sx={{ color: '#64748b' }} aria-hidden="true" />
                <Box
                  component="input"
                  ref={globalSearchRef}
                  value={globalQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalQuery(e.target.value)}
                   placeholder="Search transactions, categories, or insights..."
                  aria-label="Global search transactions"
                  sx={{
                    border: 'none',
                    outline: 'none',
                    bgcolor: 'transparent',
                    flex: 1,
                    minWidth: 0,
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    color: 'text.primary',
                    '&::placeholder': { color: 'text.secondary', opacity: 1 },
                  }}
                />
                <Box
                  component="kbd"
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    color: '#64748b',
                    border: '1px solid rgba(203, 213, 225, 0.8)',
                    borderRadius: '6px',
                    px: 0.75,
                    py: 0.25,
                    bgcolor: 'rgba(241, 245, 249, 0.8)',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                  }}
                  aria-hidden="true"
                >
                  Ctrl K
                </Box>
              </Box>
              <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />
              {recordedRange && (
                <Box
                  sx={{
                    display: { xs: 'none', lg: 'flex' },
                    alignItems: 'center',
                    gap: 1,
                    minHeight: 46,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    border: '1px solid rgba(255, 255, 255, 0.75)',
                    boxShadow: '0 2px 10px rgba(67, 87, 160, 0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                    px: 2,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': { bgcolor: 'rgba(219, 234, 254, 0.45)' },
                  }}
                  aria-label={`Recorded range ${recordedRange}`}
                  role="status"
                >
                  <CalendarMonthIcon fontSize="small" sx={{ color: '#2563eb' }} aria-hidden="true" />
                  {recordedRange}
                  <ExpandMoreIcon fontSize="small" sx={{ color: '#64748b' }} aria-hidden="true" />
                </Box>
              )}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={(e) => setBellAnchor(e.currentTarget)}
                  aria-label="Notifications"
                  aria-haspopup="menu"
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.75)',
                    boxShadow: '0 2px 10px rgba(67, 87, 160, 0.08)',
                    color: '#334155',
                    transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': { bgcolor: 'rgba(219, 234, 254, 0.6)', transform: 'translateY(-1px)' },
                  }}
                >
                  <Badge variant="dot" color="error" invisible={false}>
                    <NotificationsOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              {user && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    border: '1px solid rgba(255, 255, 255, 0.75)',
                    boxShadow: '0 2px 10px rgba(67, 87, 160, 0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                    pl: 0.75,
                    pr: 1,
                    py: 0.5,
                    minHeight: 46,
                    minWidth: 0,
                    transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                  aria-label="Signed-in user"
                  title={user.email}
                >
                  <Avatar
                    sx={{ width: 34, height: 34, bgcolor: '#2563eb', fontSize: 14, fontWeight: 700 }}
                    aria-hidden="true"
                  >
                    {userInitial(user.email)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, lineHeight: 1.25, display: { xs: 'none', sm: 'block' } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {user.role === 'admin' ? 'Administrator' : 'Member'}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => setUserAnchor(e.currentTarget)}
                    aria-label="Account menu"
                    aria-haspopup="menu"
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Button
                variant="outlined"
                size="small"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Sign out"
                sx={{
                  flexShrink: 0,
                  minHeight: 44,
                  borderRadius: '13px',
                  bgcolor: 'rgba(255,255,255,0.45)',
                  borderColor: 'rgba(37, 99, 235, 0.35)',
                  fontWeight: 600,
                  transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)', borderColor: 'primary.main' },
                }}
              >
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </Button>
            </Toolbar>
          </Box>
          <Menu
            anchorEl={bellAnchor}
            open={bellAnchor !== null}
            onClose={() => setBellAnchor(null)}
            aria-label="Notifications"
          >
            <MenuItem disabled aria-label="No new notifications">
              You&apos;re all caught up — no new notifications.
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={userAnchor}
            open={userAnchor !== null}
            onClose={() => setUserAnchor(null)}
            aria-label="Account menu"
          >
            <MenuItem disabled aria-label={`Signed in as ${user?.email ?? ''}`}>
              Signed in as {user?.email}
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setUserAnchor(null);
                void handleLogout();
              }}
              aria-label="Sign out"
            >
              Sign out
            </MenuItem>
          </Menu>
          <Container
            maxWidth="xl"
            sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 3.5 }, flex: 1, maxWidth: 1280 }}
            id="top"
          >
            <Outlet />
          </Container>
          <Box component="footer" sx={{ py: 2 }}>
            <Container maxWidth="xl" sx={{ maxWidth: 1280 }}>
              <Typography variant="caption" color="text.secondary">
                Financial Analytics · Local demo environment
              </Typography>
            </Container>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
