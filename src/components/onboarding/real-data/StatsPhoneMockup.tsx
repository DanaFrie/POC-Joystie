import { JoystieHomeIconMark } from '@/components/onboarding/good-news/JoystieHomeIconMark';
import { JoystieInstalledBadge } from '@/components/onboarding/real-data/JoystieInstalledBadge';

const PHONE_SHADOW = '2.35px 2.35px 11.751px rgba(0, 0, 0, 0.10)';
const TILE_SHADOW = '1.175px 1.175px 15px rgba(0, 0, 0, 0.10)';

function AppTile() {
  return (
    <div
      className="shrink-0 rounded-[5.88px] bg-[#f1f1f1]"
      style={{ width: 25.85, height: 25.85, boxShadow: TILE_SHADOW }}
    />
  );
}

function AppTileRow() {
  return (
    <div className="inline-flex items-center" style={{ gap: 8.23 }}>
      <AppTile />
      <AppTile />
      <AppTile />
      <AppTile />
    </div>
  );
}

function JoystieHomeIconWithBadge() {
  return (
    <div
      className="relative shrink-0 overflow-visible rounded-[11.99px] border border-white bg-v03-green-900 outline outline-1 outline-offset-[-1px] outline-white"
      style={{ width: 59.93, height: 59.93, boxShadow: TILE_SHADOW }}
    >
      <JoystieHomeIconMark />
      <JoystieInstalledBadge />
    </div>
  );
}

/** Phone with installed check — no bottom fade. */
export function StatsPhoneMockup() {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 173.07,
        height: 237.51,
        boxShadow: PHONE_SHADOW,
      }}
    >
      <div
        className="absolute rounded-[17.49px] border-[1.18px] border-white bg-[#eaeaea]"
        style={{ width: 173, height: 246, left: -0.39, top: -8 }}
      />
      <div
        className="absolute rounded-[18.41px] bg-[#d9d9d9]"
        style={{ width: 58.76, height: 9.4, left: 56.23, top: 2 }}
      />
      <div
        className="absolute rounded-[11.97px] bg-[#e3e3e3]"
        style={{ width: 48.79, height: 7.36, left: 59.84, top: 7.37 }}
      />

      <div
        className="absolute inline-flex items-center"
        style={{ left: 22.16, top: 35.25, gap: 10.58 }}
      >
        <JoystieHomeIconWithBadge />
        <div className="inline-flex flex-col" style={{ width: 57.84, gap: 10.58 }}>
          <div className="inline-flex items-center" style={{ gap: 6.13 }}>
            <AppTile />
            <AppTile />
          </div>
          <div className="inline-flex items-center" style={{ gap: 6.13 }}>
            <AppTile />
            <AppTile />
          </div>
        </div>
      </div>

      <div className="absolute" style={{ left: 22.16, top: 110.46 }}>
        <AppTileRow />
      </div>
      <div className="absolute" style={{ left: 22.16, top: 146.89 }}>
        <AppTileRow />
      </div>
    </div>
  );
}
