'use client';

import { ChildSharedPhotoBackdrop } from '@/components/onboarding/child/ChildSharedPhotoBackdrop';
import {
  ChildSharedPhotoFooter,
  ChildSharedPhotoFooterButtonStack,
  ChildSharedPhotoFooterLink,
  ChildSharedPhotoPrimaryButton,
  ChildSharedPhotoSecondaryButton,
} from '@/components/onboarding/child/ChildSharedPhotoFooter';
import { ChildSharedPhotoRetakeIcon } from '@/components/onboarding/child/ChildSharedPhotoIcons';
import {
  CHILD_SHARED_PHOTO_LIKED_LABEL,
  CHILD_SHARED_PHOTO_RETAKE_LABEL,
  CHILD_SHARED_PHOTO_SKIP_LABEL,
} from '@/lib/onboarding/childPostGameCopy';

type ChildSharedPhotoReviewStepProps = {
  photoSrc?: string | null;
  onLiked: () => void;
  onRetake: () => void;
  onSkip?: () => void;
};

/** Post-loader — review generated selfie placeholder. */
export function ChildSharedPhotoReviewStep({
  photoSrc = null,
  onLiked,
  onRetake,
  onSkip,
}: ChildSharedPhotoReviewStepProps) {
  return (
    <ChildSharedPhotoBackdrop photoSrc={photoSrc}>
      <ChildSharedPhotoFooter>
        <ChildSharedPhotoFooterButtonStack>
          <ChildSharedPhotoPrimaryButton onClick={onLiked}>
            {CHILD_SHARED_PHOTO_LIKED_LABEL}
          </ChildSharedPhotoPrimaryButton>
          <ChildSharedPhotoSecondaryButton onClick={onRetake} icon={<ChildSharedPhotoRetakeIcon />}>
            {CHILD_SHARED_PHOTO_RETAKE_LABEL}
          </ChildSharedPhotoSecondaryButton>
          {onSkip ? (
            <ChildSharedPhotoFooterLink onClick={onSkip}>
              {CHILD_SHARED_PHOTO_SKIP_LABEL}
            </ChildSharedPhotoFooterLink>
          ) : null}
        </ChildSharedPhotoFooterButtonStack>
      </ChildSharedPhotoFooter>
    </ChildSharedPhotoBackdrop>
  );
}
