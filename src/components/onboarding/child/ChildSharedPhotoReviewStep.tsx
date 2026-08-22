'use client';

import { ChildSharedPhotoBackdrop } from '@/components/onboarding/child/ChildSharedPhotoBackdrop';
import {
  ChildSharedPhotoFooter,
  ChildSharedPhotoFooterButtonStack,
  ChildSharedPhotoFooterLink,
  ChildSharedPhotoPrimaryButton,
  ChildSharedPhotoSecondaryButton,
} from '@/components/onboarding/child/ChildSharedPhotoFooter';
import { ChildSelfieCaptureCameraIcon } from '@/components/onboarding/child/ChildSharedPhotoIcons';
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
  /** True while creating Firestore child doc before share. */
  accepting?: boolean;
};

/** Post-loader — review generated selfie placeholder. */
export function ChildSharedPhotoReviewStep({
  photoSrc = null,
  onLiked,
  onRetake,
  onSkip,
  accepting = false,
}: ChildSharedPhotoReviewStepProps) {
  return (
    <ChildSharedPhotoBackdrop photoSrc={photoSrc}>
      <ChildSharedPhotoFooter>
        <ChildSharedPhotoFooterButtonStack>
          <ChildSharedPhotoPrimaryButton onClick={onLiked} disabled={accepting}>
            {accepting ? 'שומרים…' : CHILD_SHARED_PHOTO_LIKED_LABEL}
          </ChildSharedPhotoPrimaryButton>
          <ChildSharedPhotoSecondaryButton
            onClick={onRetake}
            icon={<ChildSelfieCaptureCameraIcon stroke="white" />}
          >
            {CHILD_SHARED_PHOTO_RETAKE_LABEL}
          </ChildSharedPhotoSecondaryButton>
          {onSkip ? (
            <ChildSharedPhotoFooterLink onClick={accepting ? undefined : onSkip}>
              {CHILD_SHARED_PHOTO_SKIP_LABEL}
            </ChildSharedPhotoFooterLink>
          ) : null}
        </ChildSharedPhotoFooterButtonStack>
      </ChildSharedPhotoFooter>
    </ChildSharedPhotoBackdrop>
  );
}
