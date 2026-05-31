/** Figma — turquoise check on Joystie home icon (15.44×15.44). */
export function JoystieInstalledBadge() {
  return (
    <div
      className="absolute z-[2]"
      style={{ width: 15.44, height: 15.44, left: 48.13, top: -2.72 }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full bg-v03-turquoise-300 shadow-[0_1.6px_1.6px_rgba(0,0,0,0.25)] outline outline-[1.19px] outline-[#00a272]"
      />
      <svg
        className="absolute"
        style={{ left: 4.34, top: 5.22, width: 6.65, height: 5.22 }}
        viewBox="0 0 7 6"
        fill="none"
        aria-hidden
      >
        <path
          d="M1 3L2.5 4.5L6 1"
          stroke="#0a2523"
          strokeWidth={1.42}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
