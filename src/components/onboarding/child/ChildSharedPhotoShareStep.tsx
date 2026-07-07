'use client';

import { ChildSharedPhotoBackdrop } from '@/components/onboarding/child/ChildSharedPhotoBackdrop';
import {
  ChildSharedPhotoFooter,
  ChildSharedPhotoFooterButtonStack,
  ChildSharedPhotoPrimaryButton,
  ChildSharedPhotoSecondaryButton,
} from '@/components/onboarding/child/ChildSharedPhotoFooter';
import { ChildSharedPhotoShareIcon } from '@/components/onboarding/child/ChildSharedPhotoIcons';
import { ChildSharedPhotoShareUnderline } from '@/components/onboarding/child/ChildSharedPhotoShareUnderline';
import { CHILD_SHARED_PHOTO_SHARE } from '@/constants/child-post-game-layout';
import {
  CHILD_SHARED_PHOTO_SHARE_HEADLINE_EMPHASIS,
  CHILD_SHARED_PHOTO_SHARE_HEADLINE_PREFIX,
  CHILD_SHARED_PHOTO_SHARE_PRIMARY_LABEL,
  CHILD_SHARED_PHOTO_WALLET_LABEL,
} from '@/lib/onboarding/childPostGameCopy';

type ChildSharedPhotoShareStepProps = {
  photoSrc?: string | null;
  onShare?: () => void;
  onWallet?: () => void;
};

/** Share / wallet — after user likes the selfie. */
export function ChildSharedPhotoShareStep({
  photoSrc = null,
  onShare,
  onWallet,
}: ChildSharedPhotoShareStepProps) {
  const frame = CHILD_SHARED_PHOTO_SHARE.headline;
  const underline = frame.underline;

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
        <div className="relative overflow-visible" style={{ width: frame.width, height: frame.height }}>
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
          />
        </div>
      </div>

      <ChildSharedPhotoFooter>
        <ChildSharedPhotoFooterButtonStack>
          <ChildSharedPhotoPrimaryButton onClick={onShare} icon={<ChildSharedPhotoShareIcon />}>
            {CHILD_SHARED_PHOTO_SHARE_PRIMARY_LABEL}
          </ChildSharedPhotoPrimaryButton>
          <ChildSharedPhotoSecondaryButton onClick={onWallet}>
            {CHILD_SHARED_PHOTO_WALLET_LABEL}
          </ChildSharedPhotoSecondaryButton>
        </ChildSharedPhotoFooterButtonStack>
      </ChildSharedPhotoFooter>
    </ChildSharedPhotoBackdrop>
  );
}
