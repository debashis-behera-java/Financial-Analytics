import { readPref, writePref } from '../utils/localPrefs';

/**
 * Support-request service.
 *
 * There is currently NO backend ticket endpoint (backend/src/routes
 * contains auth, analytics, transactions, health only). To connect a real
 * one later, replace `submitSupportRequest` with a POST to e.g.
 * `/support/tickets` and map server errors through `toApiErrorMessage`.
 * The `SupportRequestInput` / `SupportConfirmation` contracts are already
 * shaped for that swap.
 */

export interface SupportRequestInput {
  subject: string;
  category: string;
  description: string;
  email: string;
}

export interface SupportConfirmation {
  referenceId: string;
  createdAt: string;
  /** Always 'local-demo' until a backend endpoint is connected. */
  delivery: 'local-demo';
}

export const SUPPORT_CATEGORIES = ['General question', 'Dashboard & Analytics', 'Transactions', 'Account & Security', 'Bug report', 'Feedback'];

const OUTBOX_KEY = 'fa.support.outbox';

function makeReferenceId(): string {
  return `FA-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0')}`;
}

export function validateSupportRequest(input: SupportRequestInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (input.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters.';
  }
  if (!SUPPORT_CATEGORIES.includes(input.category)) {
    errors.category = 'Choose a valid category.';
  }
  if (input.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters so we can help.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

/** Validates, then stores the request in the on-device outbox. Never throws for transport. */
export async function submitSupportRequest(input: SupportRequestInput): Promise<SupportConfirmation> {
  const errors = validateSupportRequest(input);
  if (Object.keys(errors).length > 0) {
    throw new Error('Please fix the highlighted fields and try again.');
  }
  const confirmation: SupportConfirmation = {
    referenceId: makeReferenceId(),
    createdAt: new Date().toISOString(),
    delivery: 'local-demo',
  };
  const outbox = readPref<Array<SupportRequestInput & { referenceId: string }>>(OUTBOX_KEY, []);
  writePref(OUTBOX_KEY, [...outbox, { ...input, referenceId: confirmation.referenceId }]);
  return confirmation;
}
