'use client';

import type { ReactNode } from 'react';
import { CHILD_SHARED_PHOTO_FOOTER } from '@/constants/child-post-game-layout';

const footer = CHILD_SHARED_PHOTO_FOOTER;

const buttonTextStyle = {
  fontSize: footer.buttonFontSize,
  lineHeight: `${footer.buttonLineHeight}px`,
} as const;

type ChildSharedPhotoFooterProps = {
  children: ReactNode;
};

export function ChildSharedPhotoFooter({ children }: ChildSharedPhotoFooterProps) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center justify-end bg-v03-green-900 backdrop-blur-[4.18px]"
      style={{
        paddingTop: footer.paddingTop,
        paddingLeft: footer.paddingX,
        paddingRight: footer.paddingX,
        gap: footer.gap,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {children}
    </div>
  );
}

type ChildSharedPhotoPrimaryButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
};

export function ChildSharedPhotoPrimaryButton({
  onClick,
  children,
  icon,
}: ChildSharedPhotoPrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full cursor-pointer touch-manipulation items-center justify-center rounded-[18.41px] bg-v03-turquoise-300 font-simpler font-bold text-v03-green-900 transition hover:brightness-95"
      style={{
        maxWidth: footer.buttonWidth,
        height: footer.buttonHeight,
        padding: `${footer.buttonPaddingY}px ${footer.buttonPaddingX}px`,
        boxShadow: footer.buttonShadow,
        gap: footer.iconGap,
        ...buttonTextStyle,
      }}
    >
      <span className="inline-flex items-center gap-[6.69px]" dir="ltr">
        <span>{children}</span>
        {icon}
      </span>
    </button>
  );
}

type ChildSharedPhotoSecondaryButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
};

export function ChildSharedPhotoSecondaryButton({
  onClick,
  children,
  icon,
}: ChildSharedPhotoSecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full cursor-pointer touch-manipulation items-center justify-center rounded-[18.41px] bg-transparent font-simpler font-bold text-white outline outline-[0.84px] outline-white transition hover:bg-white/5"
      style={{
        maxWidth: footer.buttonWidth,
        height: footer.buttonHeight,
        padding: `${footer.buttonPaddingY}px ${footer.buttonPaddingX}px`,
        boxShadow: footer.buttonShadow,
        outlineOffset: -0.84,
        gap: footer.iconGap,
        ...buttonTextStyle,
      }}
    >
      <span className="inline-flex items-center gap-[6.69px]" dir="ltr">
        <span>{children}</span>
        {icon}
      </span>
    </button>
  );
}

export function ChildSharedPhotoFooterLink({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer touch-manipulation border-0 bg-transparent p-0 text-center font-simpler font-bold text-white underline"
      style={buttonTextStyle}
    >
      {children}
    </button>
  );
}

export function ChildSharedPhotoFooterButtonStack({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex w-full max-w-[301.2px] flex-col items-stretch self-center"
      style={{ gap: footer.columnGap }}
    >
      <div className="flex flex-col items-stretch" style={{ gap: footer.buttonGap }}>
        {children}
      </div>
    </div>
  );
}
