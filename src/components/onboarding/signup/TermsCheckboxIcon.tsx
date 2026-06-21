/** Figma OAuth terms checkbox — checked / unchecked. */
export function TermsCheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5Z"
          fill="#243E35"
        />
        <path
          d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5Z"
          stroke="#1BECAE"
        />
        <path
          d="M6.90918 13.4545C6.90918 13.4545 8.00009 13.4545 9.45463 16C9.45463 16 13.4974 9.33333 17.091 8"
          stroke="#1BECAE"
          strokeWidth="2.18182"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 0.5C18.3513 0.5 23.5 5.64873 23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5Z"
        fill="#243E35"
        stroke="rgba(255, 255, 255, 0.25)"
      />
    </svg>
  );
}
