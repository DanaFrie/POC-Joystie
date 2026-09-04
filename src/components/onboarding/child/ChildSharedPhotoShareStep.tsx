'use client';

import Image from 'next/image';
import { ChildSharedPhotoBackdrop } from '@/components/onboarding/child/ChildSharedPhotoBackdrop';
import { ChildSharedPhotoShareIcon } from '@/components/onboarding/child/ChildSharedPhotoIcons';
import { ChildSharedPhotoShareUnderline } from '@/components/onboarding/child/ChildSharedPhotoShareUnderline';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_SHARED_PHOTO_SHARE,
  CHILD_SHARED_PHOTO_SHARE_FOOTER,
} from '@/constants/child-post-game-layout';
import {
  CHILD_SHARED_PHOTO_CHANGE_LABEL,
  CHILD_SHARED_PHOTO_SHARE_HEADLINE_EMPHASIS,
  CHILD_SHARED_PHOTO_SHARE_HEADLINE_PREFIX,
  CHILD_SHARED_PHOTO_SHARE_PRIMARY_LABEL,
  CHILD_SHARED_PHOTO_WALLET_LABEL,
} from '@/lib/onboarding/childPostGameCopy';

type ChildSharedPhotoShareStepProps = {
  photoSrc?: string | null;
  /** Child's first agreed change text. */
  changeText?: string | null;
  onShare?: () => void;
  /** Full `/dashboard/child?token=` URL — native navigation so the token is on first load. */
  walletHref?: string | null;
  onWallet?: () => void;
};

const footer = CHILD_SHARED_PHOTO_SHARE_FOOTER;
const changeBlock = footer.changeBlock;
const buttonRow = footer.buttonRow;

/** Share / wallet — after user likes the selfie (Figma 13674:16159). */
export function ChildSharedPhotoShareStep({
  photoSrc = null,
  changeText = null,
  onShare,
  walletHref = null,
  onWallet,
}: ChildSharedPhotoShareStepProps) {
  const frame = CHILD_SHARED_PHOTO_SHARE.headline;
  const underline = frame.underline;
  const resolvedChange = changeText?.trim() || null;

  return (
    <ChildSharedPhotoBackdrop photoSrc={photoSrc}>
      <div
        className="absolute z-20 overflow-visible"
        dir="rtl"
        style={{
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
        }}
      >
        <div
          className="relative overflow-visible"
          style={{ width: frame.width, minHeight: frame.height }}
        >
          <h1
            className="mx-auto flex flex-col text-center font-simpler font-black text-white"
            style={{
              width: frame.textWidth,
              height: frame.textHeight,
              fontSize: frame.fontSize,
              letterSpacing: `${frame.letterSpacing}px`,
              textShadow: frame.textShadow,
            }}
          >
            <span className="block w-full whitespace-nowrap" style={{ lineHeight: '44px' }}>
              {CHILD_SHARED_PHOTO_SHARE_HEADLINE_PREFIX}
            </span>
            <span className="block w-full whitespace-nowrap" style={{ lineHeight: '44px' }}>
              {CHILD_SHARED_PHOTO_SHARE_HEADLINE_EMPHASIS}
            </span>
          </h1>
          <ChildSharedPhotoShareUnderline
            top={underline.top}
            left={underline.left}
            width={underline.width}
            height={underline.height}
            strokeWidth={underline.strokeWidth}
          />
        </div>
      </div>

      <div
        className="relative z-30 mt-auto flex w-full shrink-0 flex-col items-center bg-v03-green-900 backdrop-blur-[4.18px]"
        style={{
          paddingTop: footer.paddingTop,
          paddingLeft: footer.paddingX,
          paddingRight: footer.paddingX,
          paddingBottom: `max(${footer.paddingBottom}px, env(safe-area-inset-bottom))`,
          gap: footer.gap,
        }}
      >
        {resolvedChange ? (
          <div
            className="flex w-full flex-col items-center justify-center bg-v03-green-900"
            style={{
              padding: changeBlock.padding,
              gap: changeBlock.gap,
              maxWidth: 375,
            }}
          >
            <Image
              src={CHILD_ONBOARDING_ASSETS.shareChangeCheck}
              alt=""
              width={Math.round(changeBlock.checkSize)}
              height={Math.round(changeBlock.checkSize)}
              className="shrink-0"
              style={{
                width: changeBlock.checkSize,
                height: changeBlock.checkSize,
              }}
              unoptimized
            />
            <div
              className="flex flex-col items-center text-center"
              dir="rtl"
              style={{ gap: changeBlock.textGap, width: changeBlock.textWidth }}
            >
              <p
                className="w-full font-simpler font-normal"
                style={{
                  fontSize: changeBlock.labelFontSize,
                  lineHeight: changeBlock.labelLineHeight,
                  letterSpacing: `${changeBlock.labelLetterSpacing}px`,
                  color: changeBlock.labelColor,
                }}
              >
                {CHILD_SHARED_PHOTO_CHANGE_LABEL}
              </p>
              <p
                className="w-full whitespace-pre-line font-simpler font-bold text-white"
                style={{
                  fontSize: changeBlock.changeFontSize,
                  lineHeight: changeBlock.changeLineHeight,
                  letterSpacing: `${changeBlock.changeLetterSpacing}px`,
                }}
              >
                {resolvedChange}
              </p>
            </div>
          </div>
        ) : null}

        <div
          className="flex w-full items-start"
          dir="ltr"
          style={{ gap: buttonRow.gap }}
        >
          {walletHref ? (
            <a
              href={walletHref}
              dir="rtl"
              className="inline-flex min-w-0 flex-1 cursor-pointer touch-manipulation items-center justify-center overflow-hidden border border-white bg-transparent font-simpler font-bold text-white no-underline transition hover:bg-white/5"
              style={{
                height: buttonRow.height,
                borderRadius: buttonRow.radius,
                padding: `${buttonRow.paddingY}px ${buttonRow.paddingX}px`,
                boxShadow: buttonRow.shadow,
                fontSize: buttonRow.fontSize,
                lineHeight: 1.2,
                letterSpacing: '-0.3012px',
              }}
            >
              {CHILD_SHARED_PHOTO_WALLET_LABEL}
            </a>
          ) : (
            <button
              type="button"
              onClick={onWallet}
              dir="rtl"
              className="inline-flex min-w-0 flex-1 cursor-pointer touch-manipulation items-center justify-center overflow-hidden border border-white bg-transparent font-simpler font-bold text-white transition hover:bg-white/5"
              style={{
                height: buttonRow.height,
                borderRadius: buttonRow.radius,
                padding: `${buttonRow.paddingY}px ${buttonRow.paddingX}px`,
                boxShadow: buttonRow.shadow,
                fontSize: buttonRow.fontSize,
                lineHeight: 1.2,
                letterSpacing: '-0.3012px',
              }}
            >
              {CHILD_SHARED_PHOTO_WALLET_LABEL}
            </button>
          )}
          <button
            type="button"
            onClick={onShare}
            dir="rtl"
            className="inline-flex min-w-0 flex-1 cursor-pointer touch-manipulation items-center justify-center gap-[6.69px] overflow-hidden bg-v03-turquoise-300 font-simpler font-bold text-v03-green-900 transition hover:brightness-95"
            style={{
              height: buttonRow.height,
              borderRadius: buttonRow.radius,
              padding: `${buttonRow.paddingY}px ${buttonRow.paddingX}px`,
              boxShadow: buttonRow.shadow,
              fontSize: buttonRow.fontSize,
              lineHeight: 1.2,
              letterSpacing: '-0.3012px',
            }}
          >
            <span>{CHILD_SHARED_PHOTO_SHARE_PRIMARY_LABEL}</span>
            <ChildSharedPhotoShareIcon />
          </button>
        </div>
      </div>
    </ChildSharedPhotoBackdrop>
  );
}
