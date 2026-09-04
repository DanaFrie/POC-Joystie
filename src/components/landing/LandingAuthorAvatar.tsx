import Image from 'next/image';

type LandingAuthorAvatarProps = {
  src: string;
  alt?: string;
  /** Outer ring diameter. About: mobile=`lg`, desktop=`xl`. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const SIZE = {
  sm: { outer: 40, inner: 34 },
  md: { outer: 56, inner: 48 },
  lg: { outer: 64, inner: 56 },
  xl: { outer: 88, inner: 77 },
} as const;

/**
 * About-team avatar — soft white ring, diffused shadow, teal fill + turquoise glow.
 *
 * Glow is a contained radial-gradient (no `filter: blur`) so Safari/iOS won’t
 * bleed the ellipse past the circular frame.
 * Photo is slightly zoomed out so faces aren’t hard-cropped at the rim.
 */
export function LandingAuthorAvatar({ src, alt = '', size = 'sm' }: LandingAuthorAvatarProps) {
  const s = SIZE[size];
  const ring = Math.max(3, Math.round((s.outer - s.inner) / 2));

  return (
    <div
      className="relative shrink-0 rounded-full bg-gradient-to-b from-white to-[#f3f6f6] shadow-[0_4px_14px_rgba(5,22,26,0.12)]"
      style={{ width: s.outer, height: s.outer, padding: ring }}
    >
      <div
        className="relative isolate h-full w-full overflow-hidden rounded-full bg-[#05161a] [mask-image:radial-gradient(white,black)] [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
      >
        {/* Soft ellipse — no CSS filter blur (Safari clip bug) */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 80% at 50% 95%, rgba(0,255,179,0.75) 0%, rgba(0,255,179,0.35) 42%, rgba(0,255,179,0.08) 62%, transparent 78%)',
          }}
          aria-hidden
        />
        <Image
          src={src}
          alt={alt}
          width={s.inner}
          height={s.inner}
          unoptimized
          loading="lazy"
          decoding="async"
          className="relative z-[1] h-full w-full origin-center scale-[0.92] object-cover object-[center_18%]"
        />
        {/* Soft edge vignette — eases the hard circular cut */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] rounded-full"
          style={{
            boxShadow: 'inset 0 0 10px 2px rgba(5,22,26,0.18)',
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
