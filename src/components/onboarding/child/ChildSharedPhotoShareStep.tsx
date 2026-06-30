'use client';

import { ChildSharedPhotoBackdrop } from '@/components/onboarding/child/ChildSharedPhotoBackdrop';
import {
  ChildSharedPhotoFooter,
  ChildSharedPhotoFooterButtonStack,
  ChildSharedPhotoPrimaryButton,
  ChildSharedPhotoSecondaryButton,
} from '@/components/onboarding/child/ChildSharedPhotoFooter';
import { ChildSharedPhotoShareIcon } from '@/components/onboarding/child/ChildSharedPhotoIcons';
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
  const headline = CHILD_SHARED_PHOTO_SHARE.headline;

  return (
    <ChildSharedPhotoBackdrop photoSrc={photoSrc}>
      <div
        className="absolute z-20 flex items-center justify-center text-center"
        style={{
          left: headline.left,
          top: headline.top,
          width: headline.width,
          minHeight: headline.height,
        }}
      >
        <h1
          className="font-simpler font-black text-white"
          style={{
            fontSize: headline.fontSize,
            lineHeight: headline.lineHeight,
            letterSpacing: `${headline.letterSpacing}px`,
            textShadow: headline.textShadow,
          }}
        >
          {CHILD_SHARED_PHOTO_SHARE_HEADLINE_PREFIX}
          <br />
          {CHILD_SHARED_PHOTO_SHARE_HEADLINE_EMPHASIS}
        </h1>
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
