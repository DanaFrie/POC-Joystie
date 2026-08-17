export type SessionWaiterMode = 'unset' | 'show' | 'hide';

let mode: SessionWaiterMode = 'unset';
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Keep the funnel waiter mounted across /login|/onboarding → /dashboard. */
export function showSessionWaiter(): void {
  if (mode === 'show') return;
  mode = 'show';
  emit();
}

export function hideSessionWaiter(): void {
  if (mode === 'hide') return;
  mode = 'hide';
  emit();
}

export function getSessionWaiterMode(): SessionWaiterMode {
  return mode;
}

export function subscribeSessionWaiter(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
