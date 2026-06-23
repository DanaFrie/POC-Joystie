/** Green-900 ellipses behind the hero wallet. */
export function LandingHeroEllipses() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-full w-full max-w-[320px] -translate-x-1/2 -translate-y-[40%]"
      aria-hidden
    >
      <div className="pointer-events-none absolute right-[-20px] top-[20%] h-[200px] w-[210px]">
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#092125', filter: 'blur(45px)' }}
        />
      </div>
      <div className="pointer-events-none absolute left-[-30px] top-[28%] h-[190px] w-[200px]">
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#092125', filter: 'blur(45px)' }}
        />
      </div>
    </div>
  );
}
