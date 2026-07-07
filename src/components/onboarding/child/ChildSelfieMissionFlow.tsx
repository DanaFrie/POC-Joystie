'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChildSelfiePatternStep } from '@/components/onboarding/child/ChildSelfiePatternStep';
import type { SelfieCapturedFaces } from '@/components/onboarding/child/ChildSelfiePatternStep';
import { ChildSharedPhotoPreparingStep } from '@/components/onboarding/child/ChildSharedPhotoPreparingStep';
import { ChildSharedPhotoReviewStep } from '@/components/onboarding/child/ChildSharedPhotoReviewStep';
import { ChildSharedPhotoShareStep } from '@/components/onboarding/child/ChildSharedPhotoShareStep';
import { submitSelfieFaces } from '@/lib/onboarding/submitSelfieFaces';

type SelfieMissionPhase = 'pattern' | 'preparing' | 'review' | 'share';

type ChildSelfieMissionFlowProps = {
  childName: string;
  parentName?: string | null;
  parentGender?: 'female' | 'male' | null;
  parentId?: string | null;
  /** Fired once when share screen is shown — parent leaves waiting. */
  onShareReached: () => void;
};

function publicPhotoUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Mission 3 selfie loop — pattern → preview → loader → review → share.
 * Retake resets to pattern; skip without photo jumps to share.
 */
export function ChildSelfieMissionFlow({
  childName,
  parentName,
  parentGender,
  parentId,
  onShareReached,
}: ChildSelfieMissionFlowProps) {
  const [phase, setPhase] = useState<SelfieMissionPhase>('pattern');
  const [attempt, setAttempt] = useState(0);
  const [uploadTask, setUploadTask] = useState<Promise<unknown> | null>(null);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const shareSignaledRef = useRef(false);

  const goToShare = useCallback(() => {
    setUploadTask(null);
    setPhase('share');
  }, []);

  const resetToPattern = useCallback(() => {
    setUploadTask(null);
    setPhotoSrc(null);
    setAttempt((n) => n + 1);
    setPhase('pattern');
  }, []);

  useEffect(() => {
    if (phase !== 'share' || shareSignaledRef.current) return;
    shareSignaledRef.current = true;
    onShareReached();
  }, [phase, onShareReached]);

  const handleFacesReady = useCallback(
    (faces: SelfieCapturedFaces) => {
      const task = submitSelfieFaces(faces, parentId ?? undefined).then((result) => {
        setPhotoSrc(publicPhotoUrl(result.childFace));
      });
      setUploadTask(task);
    },
    [parentId],
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
