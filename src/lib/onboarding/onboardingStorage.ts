/** sessionStorage + localStorage mirror so funnel data survives route changes. */
export function readOnboardingJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  for (const store of [sessionStorage, localStorage]) {
    const raw = store.getItem(key);
    if (!raw) continue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      continue;
    }
  }
  return null;
}

export function writeOnboardingJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(value);
  sessionStorage.setItem(key, raw);
  localStorage.setItem(key, raw);
}
