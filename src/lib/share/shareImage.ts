import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ShareImage');

/**
 * Share an image file via Web Share API, or download as fallback (Option A — file, not public link).
 */
export async function shareImageFile(input: {
  imageUrl?: string;
  imageBlob?: Blob | null;
  fileName?: string;
  title?: string;
  text?: string;
}): Promise<'shared' | 'downloaded' | 'copied'> {
  const fileName = input.fileName || 'joystie-selfie.jpg';
  let blob = input.imageBlob ?? null;
  if (!blob) {
    if (!input.imageUrl) {
      throw new Error('חסרה תמונה לשיתוף');
    }
    const response = await fetch(input.imageUrl);
    if (!response.ok) {
      throw new Error('לא ניתן לטעון את התמונה לשיתוף');
    }
    blob = await response.blob();
  }
  const type = blob.type || 'image/jpeg';
  const file = new File([blob], fileName, { type });

  const nav = typeof navigator !== 'undefined' ? navigator : null;
  if (nav && typeof nav.share === 'function') {
    const canShareFiles =
      typeof nav.canShare === 'function' ? nav.canShare({ files: [file] }) : true;
    if (canShareFiles) {
      try {
        await nav.share({
          files: [file],
          title: input.title,
          text: input.text,
        });
        return 'shared';
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return 'shared';
        }
        logger.warn('navigator.share failed, falling back to download', error);
      }
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return 'downloaded';
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
