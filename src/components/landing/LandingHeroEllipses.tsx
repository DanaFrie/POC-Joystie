/** Green-900 ellipses behind the hero wallet. */
export function LandingHeroEllipses() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(70vh,520px)] w-[min(90vw,380px)] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <div className="pointer-events-none absolute right-[-10%] top-[18%] h-[55%] w-[58%]">
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#092125', filter: 'blur(45px)' }}
        />
      </div>
      <div className="pointer-events-none absolute left-[-12%] top-[28%] h-[50%] w-[52%]">
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#092125', filter: 'blur(45px)' }}
        />
      </div>
    </div>
  );
}
