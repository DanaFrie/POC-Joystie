/** Subscription plan radio — Figma 13277:11554. */
export function SubscriptionPlanRadio({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="11.5" fill="#3D574E" stroke="#00FFB3" />
        <path
          d="M7 12.5L10.5 16L17 9"
          stroke="#00FFB3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <span
      className="size-6 shrink-0 rounded-full"
      style={{ background: '#3D574E' }}
      aria-hidden
    />
  );
}
