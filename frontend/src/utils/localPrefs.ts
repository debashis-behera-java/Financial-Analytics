/**
 * Device-local preferences store (localStorage, JSON, failure-safe).
 *
 * Used for settings the backend does not model yet (notification toggles,
 * display name, appearance, display preferences). Everything here is
 * explicitly "this device" state — it never claims a server round-trip.
 */

export function readPref<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writePref<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full/blocked — preferences simply don't persist.
  }
}

export interface NotificationPrefs {
  email: boolean;
  transactionAlerts: boolean;
  insights: boolean;
  security: boolean;
}

export const NOTIFICATION_PREFS_KEY = 'fa.prefs.notifications';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  email: true,
  transactionAlerts: true,
  insights: false,
  security: true,
};

export type ThemeModePref = 'light' | 'dark' | 'system';

export const APPEARANCE_PREF_KEY = 'fa.prefs.appearance';

/**
 * The shipped MUI theme is light-only, so only 'light' can be applied.
 * Dark/System are selectable intent, stored for a future theme engine.
 */
export function readThemeMode(): ThemeModePref {
  const mode = readPref<string>(APPEARANCE_PREF_KEY, 'light');
  return mode === 'dark' || mode === 'system' || mode === 'light' ? mode : 'light';
}

export const DISPLAY_NAME_PREF_KEY = 'fa.prefs.displayName';

export interface DisplayPrefs {
  currency: string;
  dateFormat: string;
  defaultRange: string;
}

export const DISPLAY_PREFS_KEY = 'fa.prefs.display';

export const DEFAULT_DISPLAY_PREFS: DisplayPrefs = {
  currency: 'USD',
  dateFormat: 'MMM D, YYYY',
  defaultRange: '12',
};

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];
export const DATE_FORMATS = ['MMM D, YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
export const DEFAULT_RANGES = [
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
];
