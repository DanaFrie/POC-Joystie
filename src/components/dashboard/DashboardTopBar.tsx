'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { JoyWordmarkLogo } from '@/components/brand/JoyWordmarkLogo';
import { PARENT_DASHBOARD_LAYOUT } from '@/constants/parent-dashboard-layout';
import { formatNumber } from '@/utils/formatting';

type DashboardTopBarProps = {
  balance: number;
  menuSlot: ReactNode;
  /**
   * Physical side for the coin wallet (`dir="ltr"` so RTL screens cannot flip it).
   * `'end'` = left (child dashboard + parent default), `'start'` = right.
   */
  walletSide?: 'start' | 'end';
};

function DashboardCoinIcon({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22.617"
      height="22.617"
      viewBox="0 0 23 23"
      fill="none"
      className={className}
      style={style}
      aria-hidden
    >
      <path
        d="M5.9226 4.61374C7.44813 3.28448 9.63906 2.89216 11.6002 3.04508C11.9089 3.06914 12.225 3.06373 12.519 3.16984C12.8043 3.11909 13.8336 3.29585 14.1344 3.36522C16.0762 3.81296 17.757 5.28019 18.6881 7.0065C18.783 7.1824 18.9942 7.45676 18.9839 7.66177C19.2205 8.04131 19.4401 8.80993 19.5393 9.26664C20.7501 14.8434 16.289 20.3138 10.5154 19.2226C10.4287 19.2062 10.329 19.2149 10.2466 19.1846C8.22577 19.1488 6.1174 18.0541 4.80924 16.552C4.61157 16.3249 4.39612 16.0867 4.24494 15.8252C3.822 15.2812 3.34423 14.1064 3.17243 13.4638C2.97952 12.8476 2.89784 12.0928 2.87753 11.4489C2.86845 11.3492 2.87564 11.2433 2.87646 11.1431C2.89673 8.657 3.97176 6.18858 5.9226 4.61374Z"
        fill="#FDBF22"
      />
      <path
        d="M5.9226 4.61374C7.44813 3.28448 9.63906 2.89216 11.6002 3.04508C11.9089 3.06914 12.225 3.06373 12.519 3.16984C12.8043 3.11909 13.8336 3.29585 14.1344 3.36522C16.0762 3.81296 17.757 5.28019 18.6881 7.0065C18.783 7.1824 18.9942 7.45676 18.9839 7.66177C18.9209 9.04105 18.9611 10.0301 18.35 11.3892C18.3073 11.4841 18.1894 11.7811 18.1352 11.8423C18.095 10.9024 18.1532 10.3369 17.8698 9.35972C17.5106 8.01079 16.445 6.48185 15.2276 5.77516C14.2381 5.20068 12.8319 4.84424 11.6926 5.14772C11.5332 5.1368 11.3673 5.19242 11.215 5.2343C8.65717 5.93754 6.84817 8.57122 6.67461 11.1548C6.48846 13.9256 8.01563 16.4479 10.6292 17.4C9.9659 17.6885 8.19445 17.5131 7.51112 17.3359C7.4002 17.3071 7.27047 17.253 7.15721 17.2536C6.88399 17.0029 6.65124 16.7277 6.41447 16.4434C6.29648 16.4273 6.15892 16.3578 6.04226 16.3223C5.81826 16.2542 4.39293 15.8172 4.24494 15.8252C3.822 15.2812 3.34423 14.1064 3.17243 13.4638C2.97952 12.8476 2.89784 12.0928 2.87753 11.4493C2.86845 11.3492 2.87564 11.2433 2.87646 11.1431C2.89673 8.657 3.97176 6.18858 5.9226 4.61374Z"
        fill="#FEE268"
      />
      <path
        d="M5.9226 4.61426C6.03771 4.67544 6.23331 4.67257 6.36265 4.68679L7.22969 4.78936C7.42454 4.81136 7.68358 4.81565 7.86504 4.87965C5.90559 6.53559 4.76604 8.87012 4.75177 11.4615C4.75085 11.6344 4.76136 11.8077 4.75641 11.9804C4.52861 11.9394 2.95245 11.4219 2.87753 11.4494C2.86845 11.3497 2.87564 11.2438 2.87646 11.1436C2.89673 8.65752 3.97176 6.18909 5.9226 4.61426Z"
        fill="#F9AA06"
      />
      <path
        d="M5.92169 4.61374C7.44723 3.28448 9.63815 2.89216 11.5993 3.04508C11.908 3.06914 12.2241 3.06373 12.5181 3.16984L12.5083 3.1705C10.9184 3.2662 9.86786 3.52636 8.5017 4.41343C8.27964 4.5576 8.08209 4.73231 7.86414 4.87914C7.68268 4.81513 7.42364 4.81085 7.22879 4.78885L6.36175 4.68628C6.23241 4.67205 6.03681 4.67492 5.92169 4.61374Z"
        fill="#F19906"
      />
      <path
        d="M3.17194 13.4644C3.69252 13.5738 4.32702 13.8253 4.85972 13.9726C4.94988 13.9975 5.0487 14.0467 5.13939 14.0591C5.48032 15.0171 5.82465 15.6248 6.41397 16.4439C6.29598 16.4278 6.15843 16.3583 6.04177 16.3228C5.81776 16.2547 4.39243 15.8178 4.24444 15.8257C3.8215 15.2817 3.34373 14.107 3.17194 13.4644Z"
        fill="#F9AA06"
      />
      <path
        d="M2.87787 11.4493C2.95279 11.4217 4.52894 11.9393 4.75675 11.9803C4.80976 12.6922 4.92196 13.3773 5.14022 14.059C5.04953 14.0465 4.95071 13.9974 4.86055 13.9725C4.32785 13.8252 3.69335 13.5737 3.17277 13.4642C2.97985 12.848 2.89818 12.0932 2.87787 11.4493Z"
        fill="#F19906"
      />
      <path
        d="M17.8701 9.35938C18.1535 10.3366 18.0952 10.9021 18.1355 11.8419C18.0577 11.9558 18.0637 12.2771 18.0336 12.4245C17.5885 14.6073 16.1117 16.5294 13.9825 17.2963C13.2035 17.5769 12.1565 17.7121 11.3402 17.5482C13.1199 17.3624 14.7194 16.4873 15.8379 15.0892C16.579 14.1628 17.3551 12.2581 17.2181 11.0186V10.9642C17.4229 10.6276 17.7637 9.48315 17.8701 9.35938Z"
        fill="#E18E03"
      />
      <path
        d="M10.6785 17.4008C10.7894 17.3424 11.0157 17.2935 11.1485 17.2432C13.7319 16.2645 15.6081 13.9667 16.8978 11.5983C17.003 11.4051 17.0895 11.1988 17.2187 11.0198C17.3557 12.2592 16.5796 14.164 15.8385 15.0903C14.72 16.4885 13.1205 17.3635 11.3408 17.5494C11.1324 17.558 10.8778 17.4589 10.6785 17.4008Z"
        fill="#F9AA06"
      />
      <path
        d="M11.6931 5.14838C12.8324 4.8449 14.2386 5.20134 15.2282 5.77582C16.4455 6.48251 17.5111 8.01145 17.8703 9.36038C17.7639 9.48415 17.4231 10.6286 17.2183 10.9652C17.1793 10.7779 17.1825 10.5344 17.1529 10.3338C16.776 7.77936 14.7617 5.25983 12.0385 5.14882C11.9345 5.14458 11.789 5.18791 11.6931 5.14838Z"
        fill="#F9AA06"
      />
      <path
        d="M4.24536 15.8258C4.39335 15.8178 5.81868 16.2548 6.04269 16.3229C6.15935 16.3584 6.29691 16.4279 6.41489 16.444C6.65166 16.7283 6.88441 17.0035 7.15763 17.2542C7.97237 18.1556 9.05846 18.7984 10.2159 19.1533C10.2337 19.1588 10.2445 19.1659 10.247 19.1852C8.22619 19.1494 6.11783 18.0548 4.80967 16.5526C4.61199 16.3255 4.39654 16.0873 4.24536 15.8258Z"
        fill="#F19906"
      />
      <g opacity="0.25" style={{ mixBlendMode: 'color' }}>
        <ellipse cx="11.3085" cy="11.188" rx="8.43054" ry="8.28366" fill="white" />
      </g>
    </svg>
  );
}

function DashboardDoubleCoins() {
  return (
    <div className="relative h-[25.1px] w-[25.1px] shrink-0">
      <DashboardCoinIcon className="absolute left-0 top-0" />
      <DashboardCoinIcon className="absolute z-[1]" style={{ top: 2.0403, left: 3.9819 }} />
    </div>
  );
}

/** Landing-style top bar — blur glass, no fillet, flush top (safe-area is on layout). */
export function DashboardTopBar({
  balance,
  menuSlot,
  walletSide = 'end',
}: DashboardTopBarProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = header.closest('[data-v03-dashboard-screen]');
    const scroller = root?.querySelector<HTMLElement>('[data-dashboard-scroll]');
    if (!scroller) return;

    const update = () => setScrolled(scroller.scrollTop > 8);
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    return () => scroller.removeEventListener('scroll', update);
  }, []);

  const wallet = (
    <div
      className="flex h-[42px] items-center gap-1.5 rounded-full border px-3"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderColor: '#26514D',
      }}
    >
      <DashboardDoubleCoins />
      <div className="flex items-baseline gap-0.5 font-simpler text-white">
        <span className="text-[13px] font-normal tracking-[0.65px]">₪</span>
        <span className="text-[15px] font-black tracking-[0.75px]">
          {formatNumber(balance, 0)}
        </span>
      </div>
    </div>
  );
  const menu = <div className="flex items-center">{menuSlot}</div>;

  return (
    <header
      ref={headerRef}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 w-full shrink-0"
    >
      <div
        className={`pointer-events-auto flex w-full items-center justify-between transition-[background-color,backdrop-filter] duration-200 ${
          scrolled
            ? 'bg-[rgba(6,28,30,0.82)] backdrop-blur-[20px]'
            : 'bg-white/[0.02] backdrop-blur-[10px]'
        }`}
        style={{
          height: PARENT_DASHBOARD_LAYOUT.topBarHeight,
          paddingInline: PARENT_DASHBOARD_LAYOUT.gutter,
        }}
        dir="ltr"
      >
        {walletSide === 'end' ? wallet : menu}

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <JoyWordmarkLogo className="h-[34px] w-auto" />
        </div>

        {walletSide === 'end' ? menu : wallet}
      </div>
    </header>
  );
}
