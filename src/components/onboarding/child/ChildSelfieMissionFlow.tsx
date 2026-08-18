'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChildSelfiePatternStep } from '@/components/onboarding/child/ChildSelfiePatternStep';
import type { SelfieCapturedFaces } from '@/components/onboarding/child/ChildSelfiePatternStep';
import { ChildSharedPhotoPreparingStep } from '@/components/onboarding/child/ChildSharedPhotoPreparingStep';
import { ChildSharedPhotoReviewStep } from '@/components/onboarding/child/ChildSharedPhotoReviewStep';
import { ChildSharedPhotoShareStep } from '@/components/onboarding/child/ChildSharedPhotoShareStep';
import { defaultSelfieAssetForChild } from '@/lib/onboarding/defaultSelfieAsset';
import { getChildBondingContext } from '@/lib/onboarding/childBondingContext';
import {
  readPersistedChildAgreedChange,
  writePersistedChildAgreedChange,
} from '@/lib/onboarding/childFlowSession';
import { generateSelfieImage, getSelfieTransport } from '@/lib/api/selfie';
import { saveChildShareCard } from '@/lib/api/shareCard';
import { shareImageFile } from '@/lib/share/shareImage';
import { isDraftChildId } from '@/utils/url-encoding';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('SelfieMission');

type SelfieMissionPhase = 'pattern' | 'preparing' | 'review' | 'share';

type ChildSelfieMissionFlowProps = {
  childName: string;
  childGender?: string;
  parentName?: string | null;
  parentGender?: 'female' | 'male' | null;
  parentId?: string | null;
  /** Child's first agreed change — shown on results + baked into printed agreement. */
  changeText?: string | null;
  /** Fired once when share card is stored — parent may leave waiting for Screen 66. */
  onShareReached: () => void;
};

function resolveInitialChangeText(changeText?: string | null): string | null {
  return changeText?.trim() || readPersistedChildAgreedChange() || null;
}

/**
 * Mission 3 selfie loop — pattern → preview → loader → review → share.
 * On like / skip: persist share card; share button uses Web Share / download.
 */
export function ChildSelfieMissionFlow({
  childName,
  childGender = 'girl',
  parentName,
  parentGender,
  parentId,
  changeText = null,
  onShareReached,
}: ChildSelfieMissionFlowProps) {
  const router = useRouter();

  const skipPhotoSrc = useMemo(
    () => defaultSelfieAssetForChild(childGender),
    [childGender],
  );

  /** Keep agreement copy for share UI even if RTDB clears after selfie_mission_done. */
  const [latchedChangeText, setLatchedChangeText] = useState<string | null>(() =>
    resolveInitialChangeText(changeText)
  );

  useEffect(() => {
    const next = changeText?.trim();
    if (!next) return;
    setLatchedChangeText(next);
    writePersistedChildAgreedChange(next);
  }, [changeText]);

  const [phase, setPhase] = useState<SelfieMissionPhase>('pattern');
  const [attempt, setAttempt] = useState(0);
  const [uploadTask, setUploadTask] = useState<Promise<unknown> | null>(null);
  const [serviceProgress, setServiceProgress] = useState(0);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const photoSrcRef = useRef<string | null>(null);
  const photoBlobRef = useRef<Blob | null>(null);
  /** Baked headline JPEG for Storage + native share (preview keeps raw + overlay). */
  const composedShareBlobRef = useRef<Blob | null>(null);
  const shareSignaledRef = useRef(false);
  const persistStartedRef = useRef(false);

  const persistShareCard = useCallback(
    async (source: 'ai' | 'default', blob: Blob | null): Promise<boolean> => {
      const ctx = getChildBondingContext();
      const resolvedParentId = parentId || ctx?.parentId;
      if (!resolvedParentId) {
        logger.warn('Skip persist — no parentId');
        return false;
      }
      const rawChildId = ctx?.childId;
      const inviteFromUrl =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('invite')?.trim() || null
          : null;
      const inviteId = ctx?.inviteId?.trim() || inviteFromUrl;
      try {
        if (source === 'default') {
          composedShareBlobRef.current = null;
          await saveChildShareCard({
            parentId: resolvedParentId,
            childId: isDraftChildId(rawChildId) ? null : rawChildId,
            inviteId,
            source: 'default',
          });
          logger.log('Share card persisted', { source, hasInviteId: Boolean(inviteId) });
          return true;
        }

        const { composeShareCardWithHeadline } = await import(
          '@/lib/onboarding/composeShareCardWithHeadline'
        );
        const base = blob ?? skipPhotoSrc;
        const composed = await composeShareCardWithHeadline(base, {
          changeText: latchedChangeText,
        });
        composedShareBlobRef.current = composed;

        await saveChildShareCard({
          parentId: resolvedParentId,
          childId: isDraftChildId(rawChildId) ? null : rawChildId,
          inviteId,
          source,
          imageBlob: composed,
        });
        logger.log('Share card persisted', { source, hasInviteId: Boolean(inviteId) });
        return true;
      } catch (error) {
        logger.warn('Share card persist failed:', error);
        return false;
      }
    },
    [latchedChangeText, parentId, skipPhotoSrc],
  );

  const goToShareWithoutPhoto = useCallback(() => {
    setUploadTask(null);
    setServiceProgress(0);
    if (photoSrcRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(photoSrcRef.current);
    }
    photoBlobRef.current = null;
    composedShareBlobRef.current = null;
    photoSrcRef.current = skipPhotoSrc;
    setPhotoSrc(skipPhotoSrc);
    setPhase('share');
  }, [skipPhotoSrc]);

  const resetToPattern = useCallback(() => {
    setUploadTask(null);
    setServiceProgress(0);
    if (photoSrcRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(photoSrcRef.current);
    }
    photoBlobRef.current = null;
    composedShareBlobRef.current = null;
    photoSrcRef.current = null;
    setPhotoSrc(null);
    persistStartedRef.current = false;
    setAttempt((n) => n + 1);
    setPhase('pattern');
  }, []);

  /** Persist to Storage first — only then signal parent (completion waits on cloud card). */
  useEffect(() => {
    if (phase !== 'share' || persistStartedRef.current) return;
    persistStartedRef.current = true;
    const isDefault =
      !photoBlobRef.current ||
      photoSrcRef.current === skipPhotoSrc ||
      Boolean(photoSrcRef.current && !photoSrcRef.current.startsWith('blob:'));
    const source = isDefault ? 'default' : 'ai';
    const blob = photoBlobRef.current;

    void (async () => {
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const ok = await persistShareCard(source, blob);
        if (ok) {
          if (!shareSignaledRef.current) {
            shareSignaledRef.current = true;
            onShareReached();
          }
          return;
        }
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => window.setTimeout(r, 800 * (attempt + 1)));
        }
      }
      logger.error('Share card not stored — parent will stay on waiting');
    })();
  }, [phase, persistShareCard, skipPhotoSrc, onShareReached]);

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
        transport: getSelfieTransport(),
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
          photoBlobRef.current = blob;
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

  const handleShare = useCallback(async () => {
    try {
      let blob = composedShareBlobRef.current;
      if (!blob) {
        const { composeShareCardWithHeadline } = await import(
          '@/lib/onboarding/composeShareCardWithHeadline'
        );
        const base = photoBlobRef.current ?? photoSrcRef.current;
        if (!base) return;
        blob = await composeShareCardWithHeadline(base, {
          changeText: latchedChangeText,
        });
        composedShareBlobRef.current = blob;
      }
      await shareImageFile({
        imageBlob: blob,
        fileName: 'joystie-handshake.jpg',
        title: 'Joystie',
        text: 'החוזה שלנו ב- joystie.com',
      });
    } catch (error) {
      logger.warn('Share failed:', error);
    }
  }, [latchedChangeText]);

  if (phase === 'pattern') {
    return (
      <ChildSelfiePatternStep
        key={attempt}
        childName={childName}
        parentName={parentName}
        parentGender={parentGender}
        onFacesReady={handleFacesReady}
        onPreviewComplete={() => setPhase('preparing')}
        onSkipWithoutPhoto={goToShareWithoutPhoto}
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
        onSkip={goToShareWithoutPhoto}
      />
    );
  }

  return (
    <ChildSharedPhotoShareStep
      photoSrc={photoSrc}
      changeText={latchedChangeText}
      onShare={() => void handleShare()}
      onWallet={() => {
        void (async () => {
          const ctx = getChildBondingContext();
          const resolvedParentId = parentId || ctx?.parentId;
          if (!resolvedParentId) {
            router.push('/dashboard/child');
            return;
          }
          try {
            const { resolveDashboardChildShareUrl } = await import(
              '@/lib/api/bondingInvites'
            );
            const rawChildId = ctx?.childId;
            const absolute = await resolveDashboardChildShareUrl({
              parentId: resolvedParentId,
              childId: isDraftChildId(rawChildId) ? null : rawChildId,
            });
            const path = new URL(absolute).pathname + new URL(absolute).search;
            router.push(path);
          } catch (error) {
            logger.warn('Wallet URL resolve failed:', error);
            router.push('/dashboard/child');
          }
        })();
      }}
    />
  );
}
