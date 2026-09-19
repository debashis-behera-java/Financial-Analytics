/**
 * Cross-component global search wiring.
 *
 * The header search box lives in AppShell while the real search state lives
 * in TransactionSection (debounced, server-side). Submitting the header box
 * dispatches this event; TransactionSection applies the query to its actual
 * filter, scrolls to the table, and focuses the field — no duplicated state.
 */
export const GLOBAL_SEARCH_EVENT = 'fa:global-search';

export function dispatchGlobalSearch(query: string): void {
  window.dispatchEvent(new CustomEvent<string>(GLOBAL_SEARCH_EVENT, { detail: query }));
}
