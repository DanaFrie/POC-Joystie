'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChildSelfiePatternStep } from '@/components/onboarding/child/ChildSelfiePatternStep';
import type { SelfieCapturedFaces } from '@/components/onboarding/child/ChildSelfiePatternStep';
import { ChildSharedPhotoPreparingStep } from '@/components/onboarding/child/ChildSharedPhotoPreparingStep';
import { ChildSharedPhotoReviewStep } from '@/components/onboarding/child/ChildSharedPhotoReviewStep';
import { ChildSharedPhotoShareStep } from '@/components/onboarding/child/ChildSharedPhotoShareStep';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { generateSelfieImage } from '@/lib/api/selfie';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('SelfieMission');

type SelfieMissionPhase = 'pattern' | 'preparing' | 'review' | 'share';

type ChildSelfieMissionFlowProps = {
  childName: string;
  childGender?: string;
  parentName?: string | null;
  parentGender?: 'female' | 'male' | null;
  parentId?: string | null;
  /** Fired once when share screen is shown — parent leaves waiting. */
  onShareReached: () => void;
};

/**
 * Mission 3 selfie loop — pattern → preview → loader → review → share.
 * Retake resets to pattern; skip without photo jumps to share.
 */
export function ChildSelfieMissionFlow({
  childName,
  childGender = 'girl',
  parentName,
  parentGender,
  parentId,
  onShareReached,
}: ChildSelfieMissionFlowProps) {
  void parentId;

  const skipPhotoSrc = useMemo(
    () =>
      parentGender === 'female'
        ? CHILD_ONBOARDING_ASSETS.motherChildDori
        : CHILD_ONBOARDING_ASSETS.fatherChildDori,
    [parentGender],
  );

  const [phase, setPhase] = useState<SelfieMissionPhase>('pattern');
  const [attempt, setAttempt] = useState(0);
  const [uploadTask, setUploadTask] = useState<Promise<unknown> | null>(null);
  const [serviceProgress, setServiceProgress] = useState(0);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const photoSrcRef = useRef<string | null>(null);
  const shareSignaledRef = useRef(false);

  const goToShare = useCallback(() => {
    setUploadTask(null);
    setServiceProgress(0);
    if (!photoSrcRef.current) {
      photoSrcRef.current = skipPhotoSrc;
      setPhotoSrc(skipPhotoSrc);
    }
    setPhase('share');
  }, [skipPhotoSrc]);

  const resetToPattern = useCallback(() => {
    setUploadTask(null);
    setServiceProgress(0);
    if (photoSrcRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(photoSrcRef.current);
    }
    photoSrcRef.current = null;
    setPhotoSrc(null);
    setAttempt((n) => n + 1);
    setPhase('pattern');
  }, []);

  useEffect(() => {
    if (phase !== 'share' || shareSignaledRef.current) return;
    shareSignaledRef.current = true;
    onShareReached();
  }, [phase, onShareReached]);

  useEffect(
    () => () => {
      if (photoSrcRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(photoSrcRef.current);
      }
    },
    [],
  );

  const handleFacesReady = useCallback(
    (faces: SelfieCapturedFaces) => {
      logger.log('Faces captured — sending to generation service', {
        childFaceBytes: faces.childFace.size,
        parentFaceBytes: faces.parentFace.size,
        childGender,
        parentGender: parentGender ?? 'female',
        transport: 'firebase',
      });

      const task = generateSelfieImage({
        childFace: faces.childFace,
        parentFace: faces.parentFace,
        childGender,
        parentGender: parentGender ?? 'female',
        onProgress: (percent) => {
          logger.debug('Generation progress', { percent });
          setServiceProgress(percent);
        },
      })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          if (photoSrcRef.current?.startsWith('blob:')) {
            URL.revokeObjectURL(photoSrcRef.current);
          }
          photoSrcRef.current = url;
          setPhotoSrc(url);
          logger.log('Review image ready', {
            blobBytes: blob.size,
            blobType: blob.type,
            previewUrl: url.slice(0, 32) + '…',
          });
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          logger.error('Generation task failed in mission flow', { message });
          throw error;
        });
      setUploadTask(task);
    },
    [childGender, parentGender],
  );

  if (phase === 'pattern') {
    return (
      <ChildSelfiePatternStep
        key={attempt}
        childName={childName}
        parentName={parentName}
        parentGender={parentGender}
        onFacesReady={handleFacesReady}
        onPreviewComplete={() => setPhase('preparing')}
        onSkipWithoutPhoto={goToShare}
      />
    );
  }

  if (phase === 'preparing') {
    return (
      <ChildSharedPhotoPreparingStep
        task={uploadTask}
        progressPercent={serviceProgress}
        onComplete={() => setPhase('review')}
      />
    );
  }

  if (phase === 'review') {
    return (
      <ChildSharedPhotoReviewStep
        photoSrc={photoSrc}
        onLiked={() => setPhase('share')}
        onRetake={resetToPattern}
        onSkip={goToShare}
      />
    );
  }

  return (
    <ChildSharedPhotoShareStep
      photoSrc={photoSrc}
      onShare={() => {}}
      onWallet={() => {}}
    />
  );
}
