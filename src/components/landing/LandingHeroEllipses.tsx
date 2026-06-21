/** Green-900 ellipses 387 + 388 behind the hero wallet — Figma 375×812. */
export function LandingHeroEllipses() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-[140px] top-[267px] h-[248px] w-[265px] overflow-visible"
        aria-hidden
      >
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#092125', filter: 'blur(45px)' }}
        />
      </div>
      <div
        className="pointer-events-none absolute left-[-24px] top-[284px] h-[236px] w-[253px] overflow-visible"
        aria-hidden
      >
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#092125', filter: 'blur(45px)' }}
        />
      </div>
    </div>
  );
}
