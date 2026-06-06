import { JoystieHomeIconMark } from '@/components/onboarding/good-news/JoystieHomeIconMark';

const TILE_PX = 59.93;
const HEADER_PX = 30;
const SCALE = HEADER_PX / TILE_PX;
const OFFSET_PX = (HEADER_PX - TILE_PX * SCALE) / 2;

/** Figma stats card header — 30×30, radius 6, #092523 + scaled home mark. */
export function JoystieComparisonHeaderIcon() {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[6px] bg-[#092523]"
      style={{ width: HEADER_PX, height: HEADER_PX }}
    >
      <div
        className="pointer-events-none absolute origin-top-left"
        style={{
          width: TILE_PX,
          height: TILE_PX,
          left: OFFSET_PX,
          top: OFFSET_PX,
          transform: `scale(${SCALE})`,
        }}
      >
        <div className="relative" style={{ width: TILE_PX, height: TILE_PX }}>
          <JoystieHomeIconMark glowFilterId="joystie-real-data-stats-header-glow" />
        </div>
      </div>
    </div>
  );
}
