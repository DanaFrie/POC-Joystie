import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ShareImage');

/**
 * Load an image into a Blob for Web Share / download.
 * Prefetch this under the hood so the share tap stays within a user gesture.
 */
export async function loadImageBlob(input: {
  imageUrl?: string;
  imageBlob?: Blob | null;
}): Promise<Blob> {
  if (input.imageBlob) return input.imageBlob;
  if (!input.imageUrl) {
    throw new Error('חסרה תמונה לשיתוף');
  }

  const url = input.imageUrl;
  if (url.startsWith('data:')) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('לא ניתן לטעון את התמונה לשיתוף');
    return response.blob();
  }

  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    // Prod Storage CORS often omits localhost — proxy same-origin, then canvas.
    logger.warn('fetch image failed, trying same-origin proxy', error);
    try {
      return await loadImageBlobViaProxy(url);
    } catch (proxyError) {
      logger.warn('proxy image failed, trying canvas fallback', proxyError);
      return await blobFromImageElement(url);
    }
  }
}

async function loadImageBlobViaProxy(url: string): Promise<Blob> {
  const response = await fetch(`/api/share-image?url=${encodeURIComponent(url)}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.blob();
}

function blobFromImageElement(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('לא ניתן להכין את התמונה לשיתוף'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('לא ניתן להכין את התמונה לשיתוף'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('לא ניתן לטעון את התמונה לשיתוף'));
    img.src = url;
  });
}

function triggerDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Share an image file via Web Share API, or download as fallback.
 * Prefer passing a prefetched `imageBlob` so share stays in the user-gesture window.
 */
export async function shareImageFile(input: {
  imageUrl?: string;
  imageBlob?: Blob | null;
  fileName?: string;
  title?: string;
  text?: string;
}): Promise<'shared' | 'downloaded' | 'copied'> {
  const fileName = input.fileName || 'joystie-handshake.jpg';
  const blob = await loadImageBlob({
    imageUrl: input.imageUrl,
    imageBlob: input.imageBlob,
  });
  const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'image/jpeg';
  const file = new File([blob], fileName, { type });

  const nav = typeof navigator !== 'undefined' ? navigator : null;
  if (nav && typeof nav.share === 'function') {
    const shareDataWithFiles: ShareData = {
      files: [file],
      title: input.title,
      text: input.text,
    };
    const canShareFiles =
      typeof nav.canShare !== 'function' || nav.canShare(shareDataWithFiles);

    if (canShareFiles) {
      try {
        await nav.share(shareDataWithFiles);
        return 'shared';
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return 'shared';
        }
        logger.warn('navigator.share(files) failed, trying text share', error);
      }
    }

    // Desktop / browsers that reject files — still open the native sheet with text.
    if (input.text || input.title) {
      try {
        const textOnly: ShareData = {
          title: input.title,
          text: input.text,
        };
        if (typeof nav.canShare !== 'function' || nav.canShare(textOnly)) {
          await nav.share(textOnly);
          // Also download so the agreement image is still delivered.
          triggerDownload(blob, fileName);
          return 'downloaded';
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return 'shared';
        }
        logger.warn('navigator.share(text) failed, falling back to download', error);
      }
    }
  }

  triggerDownload(blob, fileName);
  return 'downloaded';
}
