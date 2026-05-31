import {
  V03_SCREEN_HEIGHT,
  V03_SCREEN_WIDTH,
} from '@/constants/v03-screen';

/**
 * Onboarding grid — inline SVG in 375×812 space (scaled by FunnelViewport).
 * Figma flex `gap` = space between 1px lines → step = gap + 1px.
 */
const SCREEN_W = V03_SCREEN_WIDTH;
const SCREEN_H = V03_SCREEN_HEIGHT;
const GAP_VERTI = 80.687;
const GAP_HORI = 86.385;
const OFFSET_X = -64;
const OFFSET_Y = -19;
const LINE_W = 1;
const STROKE = '#FFFFFF0D';

/** Lines from start, every (gap + lineWidth), while intersecting [0, max]. */
function linePositions(start: number, gap: number, max: number): number[] {
  const step = gap + LINE_W;
  const positions: number[] = [];
  for (let pos = start; pos <= max + step; pos += step) {
    if (pos >= 0 && pos <= max) positions.push(pos);
  }
  return positions;
}

const VERTICAL_XS = linePositions(OFFSET_X, GAP_VERTI, SCREEN_W);
const HORIZONTAL_YS = linePositions(OFFSET_Y, GAP_HORI, SCREEN_H);

export function OnboardingGrid() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] block h-full w-full"
      viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {VERTICAL_XS.map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={SCREEN_H}
          stroke={STROKE}
          strokeWidth={LINE_W}
        />
      ))}
      {HORIZONTAL_YS.map((y) => (
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={SCREEN_W}
          y2={y}
          stroke={STROKE}
          strokeWidth={LINE_W}
        />
      ))}
    </svg>
  );
}
