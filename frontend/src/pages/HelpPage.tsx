import { useEffect, useMemo, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import {
  SUPPORT_CATEGORIES,
  submitSupportRequest,
  validateSupportRequest,
} from '../api/support';
import type { SupportConfirmation } from '../api/support';

interface Faq {
  topic: string;
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    topic: 'getting-started',
    question: 'How do I view my financial overview?',
    answer:
      'Open the dashboard (the default page after sign-in). The KPI cards, Revenue vs Expenses chart, and Category Breakdown load automatically from the live API — no setup is required.',
  },
  {
    topic: 'transactions',
    question: 'How do I filter transactions?',
    answer:
      'In the Transactions section, use Search, Category, Status, dates, amounts, or User ID. Search, category, and status apply immediately; date/amount ranges apply when you press Apply Filters. Reset clears everything.',
  },
  {
    topic: 'transactions',
    question: 'How do I export transactions?',
    answer:
      'Press Export CSV in the Transactions header, choose the columns you want, then Export. The file contains every record matching your current search and filters — never just the visible page.',
  },
  {
    topic: 'dashboard',
    question: 'How is net balance calculated?',
    answer:
      'Net Balance is Total Revenue minus Total Expenses, aggregated server-side from all recorded transactions (GET /api/analytics/summary). A positive balance shows in green, a negative one in red.',
  },
  {
    topic: 'reports',
    question: 'Does the app have downloadable reports?',
    answer:
      'There is no separate Reports page. Use Export CSV in the Transactions section — filtered exports serve as your downloadable reports.',
  },
  {
    topic: 'account',
    question: 'How do I change my profile information?',
    answer:
      'Go to Settings → Profile. Your display name is stored on this device and can be edited there; your email and role are managed by your administrator.',
  },
  {
    topic: 'account',
    question: 'How do I change notification settings?',
    answer:
      'Go to Settings → Notifications. The four toggles take effect immediately and are remembered on this device.',
  },
  {
    topic: 'account',
    question: 'How do I change my password?',
    answer:
      'Open Settings → Security. Self-service password changes are not connected in this version because the backend exposes no password endpoint — please contact your administrator.',
  },
  {
    topic: 'getting-started',
    question: 'How do I contact support?',
    answer:
      'Use the Contact Support card below. Fill in subject, category, and description — your request is validated and saved, and the team card explains exactly where it goes.',
  },
];

const TOPICS = [
  { value: 'getting-started', label: 'Getting Started', icon: <RocketLaunchOutlinedIcon /> },
  { value: 'dashboard', label: 'Dashboard & Analytics', icon: <AssessmentOutlinedIcon /> },
  { value: 'transactions', label: 'Transactions', icon: <ReceiptLongOutlinedIcon /> },
  { value: 'reports', label: 'Reports', icon: <AssessmentOutlinedIcon /> },
  { value: 'account', label: 'Account & Security', icon: <AccountCircleOutlinedIcon /> },
];

const QUICK_CARDS = [
  { topic: 'getting-started', title: 'Getting Started', hint: 'Sign in, navigate, and find things.' },
  { topic: 'dashboard', title: 'Dashboard & Analytics', hint: 'KPIs, charts, and balances.' },
  { topic: 'transactions', title: 'Transactions', hint: 'Search, filter, sort, and export.' },
  { topic: 'reports', title: 'Reports', hint: 'CSV exports as reports.' },
  { topic: 'account', title: 'Account & Security', hint: 'Profile, notifications, password.' },
];

type SystemState = 'checking' | 'operational' | 'degraded';

/** Support center: searchable local FAQs, contact flow, and a live backend health check. */
export function HelpPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState(SUPPORT_CATEGORIES[0] as string);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<SupportConfirmation | null>(null);
  const [systemState, setSystemState] = useState<SystemState>('checking');
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  async function checkSystemStatus(): Promise<void> {
    setSystemState('checking');
    try {
      const { data } = await apiClient.get<{ status: string }>('/health', { timeout: 8000 });
      setSystemState(data?.status === 'ok' ? 'operational' : 'degraded');
    } catch {
      setSystemState('degraded');
    } finally {
      setCheckedAt(new Date().toLocaleTimeString());
    }
  }

  useEffect(() => {
    void checkSystemStatus();
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((faq) => {
      if (topic !== null && faq.topic !== topic) return false;
      if (q === '') return true;
      return `${faq.question} ${faq.answer}`.toLowerCase().includes(q);
    });
  }, [query, topic]);

  function handleQuickCard(cardTopic: string): void {
    setTopic((prev) => (prev === cardTopic ? null : cardTopic));
    setQuery('');
    requestAnimationFrame(() => {
      document.getElementById('faq-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function openDialog(category: string): void {
    setDialogCategory(category);
    setFieldErrors({});
    setConfirmation(null);
    setDialogOpen(true);
  }

  async function handleSubmitRequest(): Promise<void> {
    const input = { subject, category: dialogCategory, description, email };
    const errors = validateSupportRequest(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    try {
      const result = await submitSupportRequest(input);
      setConfirmation(result);
    } catch (error) {
      setFieldErrors({ form: error instanceof Error ? error.message : 'Could not save your request.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeDialog(): void {
    if (isSubmitting) return;
    setDialogOpen(false);
    setConfirmation(null);
    setSubject('');
    setDescription('');
    setFieldErrors({});
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Help & Support
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Answers, guides, and a direct line for anything else.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: '24px', mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <TextField
            label="Search help articles"
            placeholder="Search help articles..."
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            aria-label="Search help articles"
          />
        </CardContent>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {QUICK_CARDS.map((card) => {
          const meta = TOPICS.find((t) => t.value === card.topic);
          const selected = topic === card.topic;
          return (
            <Grid key={card.topic} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card
                sx={{
                  borderRadius: '20px',
                  height: '100%',
                  cursor: 'pointer',
                  border: selected ? '2px solid #2563eb' : undefined,
                  transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(70, 90, 140, 0.14)' },
                }}
                onClick={() => handleQuickCard(card.topic)}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`Filter help by ${card.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleQuickCard(card.topic);
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 1 }} aria-hidden="true">
                    {meta?.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.hint}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ borderRadius: '24px', height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }} id="faq-list">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" component="h2">
                  Frequently Asked Questions
                </Typography>
                {topic && (
                  <Chip
                    label={TOPICS.find((t) => t.value === topic)?.label}
                    size="small"
                    onDelete={() => setTopic(null)}
                    color="primary"
                    aria-label="Clear topic filter"
                  />
                )}
              </Box>
              {filteredFaqs.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No articles match “{query}”.
                  </Typography>
                  <Button
                    sx={{ mt: 1.5 }}
                    variant="outlined"
                    onClick={() => {
                      setQuery('');
                      setTopic(null);
                    }}
                  >
                    Clear search
                  </Button>
                </Box>
              ) : (
                filteredFaqs.map((faq) => (
                  <Accordion key={faq.question} sx={{ borderRadius: 2, mb: 1, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-label={faq.question}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ borderRadius: '24px' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
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
                    }}
                    aria-hidden="true"
                  >
                    <SupportAgentIcon />
                  </Box>
                  <Typography variant="h6" component="h2">
                    Still need help?
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Send a request and keep the reference for follow-up.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Button
                    variant="contained"
                    startIcon={<ForumOutlinedIcon fontSize="small" />}
                    onClick={() => openDialog('General question')}
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReportProblemOutlinedIcon fontSize="small" />}
                    onClick={() => openDialog('Bug report')}
                  >
                    Report a Problem
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon fontSize="small" />}
                    onClick={() => openDialog('Feedback')}
                  >
                    Send Feedback
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: '24px' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
                  System Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor:
                        systemState === 'operational' ? '#16a34a' : systemState === 'checking' ? '#d97706' : '#dc2626',
                      boxShadow:
                        systemState === 'operational'
                          ? '0 0 12px rgba(22,163,74,0.6)'
                          : 'none',
                    }}
                    aria-hidden="true"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }} aria-live="polite">
                    {systemState === 'operational'
                      ? 'All systems operational'
                      : systemState === 'checking'
                        ? 'Checking system status…'
                        : 'Backend unreachable — showing cached data'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  {checkedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Checked at {checkedAt}
                    </Typography>
                  )}
                  <Button size="small" onClick={() => void checkSystemStatus()} disabled={systemState === 'checking'}>
                    Retry
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm" aria-labelledby="support-dialog-title">
        <DialogTitle id="support-dialog-title">Contact Support</DialogTitle>
        <DialogContent>
          {confirmation ? (
            <Box sx={{ py: 1 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Support request submitted — reference {confirmation.referenceId}.
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Demo mode: there is no support-ticket API connected yet, so your request was validated and saved
                on this device only. It was not sent to a real support team.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {fieldErrors.form && <Alert severity="error">{fieldErrors.form}</Alert>}
              <TextField
                label="Subject"
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                error={fieldErrors.subject !== undefined}
                helperText={fieldErrors.subject}
              />
              <TextField
                label="Category"
                select
                fullWidth
                value={dialogCategory}
                onChange={(e) => setDialogCategory(e.target.value)}
                error={fieldErrors.category !== undefined}
                helperText={fieldErrors.category}
              >
                {SUPPORT_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email !== undefined}
                helperText={fieldErrors.email ?? 'Replies go here.'}
              />
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={fieldErrors.description !== undefined}
                helperText={fieldErrors.description ?? 'At least 20 characters — steps to reproduce help.'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{confirmation ? 'Close' : 'Cancel'}</Button>
          {!confirmation && (
            <Button variant="contained" onClick={() => void handleSubmitRequest()} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
