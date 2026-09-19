import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delayMs` after it stops changing.
 * Used for the transaction search field so the backend is queried ~400ms
 * after the user stops typing instead of on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
