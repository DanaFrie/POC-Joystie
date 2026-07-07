'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SelfieCameraStatus = 'idle' | 'pending' | 'active' | 'denied';

export function useSelfieCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<SelfieCameraStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const releaseCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  const requestCamera = useCallback(async () => {
    releaseCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('denied');
      return;
    }

    setStatus('pending');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setStream(stream);
      setStatus('active');
    } catch {
      setStatus('denied');
    }
  }, [releaseCamera]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || status !== 'active') return;

    video.srcObject = stream;
    void video.play().catch(() => {
      /* autoplay blocked */
    });
  }, [status]);

  useEffect(() => () => releaseCamera(), [releaseCamera]);

  return { videoRef, status, stream, requestCamera, releaseCamera };
};
