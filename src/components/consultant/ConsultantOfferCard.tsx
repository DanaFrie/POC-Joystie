'use client';

import type { ReactNode } from 'react';
import type { ConsultantOffer } from '@/constants/consultant-marketing';

/**
 * Soft mint/white ellipse. Radial gradient so the glow stays inside overflow:hidden.
 * Same treatment as the product cards on /consultant.
 */
function SoftEllipse({
  className,
  tone = 'mint',
}: {
  className?: string;
  tone?: 'mint' | 'white';
}) {
  const color =
    tone === 'white' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(203, 250, 236, 0.55)';
  return (
    <div
      className={`pointer-events-none absolute rounded-full ${className ?? ''}`}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
      }}
      aria-hidden
    />
  );
}

export function ConsultantOfferCard({
  offer,
  size = 'desktop',
  titleAs = 'h3',
  action,
  actionClassName,
}: {
  offer: ConsultantOffer;
  size?: 'desktop' | 'mobile' | 'responsive';
  titleAs?: 'h1' | 'h3';
  action?: ReactNode;
  actionClassName?: string;
}) {
  const isMobile = size === 'mobile';
  const isResponsive = size === 'responsive';
  const title = isMobile && offer.titleMobile ? offer.titleMobile : offer.title;
  const subtitle =
    isMobile && offer.subtitleMobile ? offer.subtitleMobile : offer.subtitle;
  const meta = isMobile && offer.metaMobile ? offer.metaMobile : offer.meta;
  const TitleTag = titleAs;

  const articleClass = isResponsive
    ? 'relative flex min-h-[260px] w-full flex-col justify-between overflow-hidden rounded-[45px] border border-white/10 bg-[rgba(5,22,26,0.10)] px-[35px] py-[30px] md:min-h-[310px] md:bg-white/[0.08] md:px-10 md:py-[35px] md:backdrop-blur-[12px]'
    : `relative flex w-full flex-col justify-between overflow-hidden ${
        isMobile
          ? 'min-h-[260px] rounded-[45px] border border-white/10 px-[35px] py-[30px]'
          : 'min-h-[310px] rounded-[45px] border border-white/10 bg-white/[0.08] px-10 py-[35px] backdrop-blur-[12px]'
      }`;

  const titleClass = isResponsive
    ? 'font-rubik text-[24px] font-extrabold leading-[1.1] tracking-[-0.72px] text-white md:text-[30px] md:tracking-[-0.9px]'
    : `font-rubik font-extrabold leading-[1.1] text-white ${
        isMobile ? 'text-[24px] tracking-[-0.72px]' : 'text-[30px] tracking-[-0.9px]'
      }`;

  const subtitleClass = isResponsive
    ? 'font-rubik text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-[#BCC8CB] md:text-[20px] md:leading-[1.2] md:tracking-[-0.4px]'
    : `font-rubik font-normal text-[#BCC8CB] ${
        isMobile
          ? 'text-[16px] leading-[1.28] tracking-[-0.32px]'
          : 'text-[20px] leading-[1.2] tracking-[-0.4px]'
      }`;

  const metaClass = isResponsive
    ? 'flex min-w-0 flex-1 flex-col gap-2 text-right text-[20px] leading-[1.2] tracking-[-0.4px] text-white md:gap-3 md:text-[24px] md:leading-[1.17] md:tracking-[-0.72px]'
    : `flex min-w-0 flex-1 flex-col text-right text-white ${
        isMobile
          ? 'gap-2 text-[20px] leading-[1.2] tracking-[-0.4px]'
          : 'gap-3 text-[24px] leading-[1.17] tracking-[-0.72px]'
      }`;

  const defaultActionClass = 'mt-6 flex w-full justify-start';

  return (
    <article
      className={articleClass}
      style={isMobile ? { background: 'rgba(5, 22, 26, 0.10)' } : undefined}
    >
      {isMobile || isResponsive ? (
        <div
          className={`pointer-events-none absolute z-0 rounded-full ${isResponsive ? 'md:hidden' : ''}`}
          style={{
            width: 169,
            height: 169,
            left: 246,
            top: 207.5,
            background: 'rgba(203, 250, 236, 0.40)',
            filter: 'blur(100px)',
          }}
          aria-hidden
        />
      ) : null}
      {!isMobile ? (
        <div className={isResponsive ? 'hidden md:contents' : 'contents'}>
          <SoftEllipse tone="white" className="bottom-[-50px] left-[-40px] size-[240px]" />
          <SoftEllipse tone="mint" className="bottom-[-24px] left-[-8px] size-[192px]" />
        </div>
      ) : null}
      <div className="relative z-[1] flex w-full flex-1 flex-col items-end justify-between text-right">
        <div className="flex w-full flex-col gap-[25px]">
          <div className="flex flex-col gap-1.5">
            <TitleTag className={titleClass}>
              {isResponsive ? (
                <>
                  <span className="md:hidden">{offer.titleMobile ?? offer.title}</span>
                  <span className="hidden md:inline">{offer.title}</span>
                </>
              ) : (
                title
              )}
            </TitleTag>
            <p className={subtitleClass}>
              {isResponsive ? (
                <>
                  <span className="md:hidden">{offer.subtitleMobile ?? offer.subtitle}</span>
                  <span className="hidden md:inline">{offer.subtitle}</span>
                </>
              ) : (
                subtitle
              )}
            </p>
          </div>
          <div className="flex items-stretch gap-[15px]" dir="rtl">
            <div
              className="w-[4px] shrink-0 self-stretch rounded-[300px]"
              style={{ background: 'rgba(255, 255, 255, 0.10)' }}
              aria-hidden
            />
            <div className={metaClass}>
              <p className="whitespace-pre-wrap font-rubik font-normal" dir="rtl">
                {isResponsive ? (
                  <>
                    <span className="md:hidden">{offer.metaMobile ?? offer.meta}</span>
                    <span className="hidden md:inline">{offer.meta}</span>
                  </>
                ) : (
                  meta
                )}
              </p>
              <p className="font-rubik font-bold" dir="rtl">
                {offer.priceLabel}
              </p>
            </div>
          </div>
        </div>
        {action ? (
          <div className={actionClassName ?? defaultActionClass}>{action}</div>
        ) : null}
      </div>
    </article>
  );
}
