'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SelfieCameraStatus = 'idle' | 'pending' | 'active' | 'denied';

function isPermissionDeniedError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === 'NotAllowedError' ||
    error.name === 'PermissionDeniedError' ||
    error.name === 'SecurityError'
  );
}

function attachStreamToVideo(video: HTMLVideoElement, mediaStream: MediaStream) {
  if (video.srcObject !== mediaStream) {
    video.srcObject = mediaStream;
  }

  const play = () => {
    void video.play().catch(() => {
      /* autoplay blocked */
    });
  };

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    play();
    return;
  }

  video.addEventListener('loadeddata', play, { once: true });
}

export function useSelfieCameraStream() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestSeqRef = useRef(0);
  const autoRetriedRef = useRef(false);
  const [status, setStatus] = useState<SelfieCameraStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const bindVideoElement = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (!video) return;

    const activeStream = streamRef.current;
    if (activeStream && status === 'active') {
      attachStreamToVideo(video, activeStream);
    }
  }, [status]);

  const stopStreamTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setVideoReady(false);
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  const releaseCamera = useCallback(() => {
    requestSeqRef.current += 1;
    autoRetriedRef.current = false;
    stopStreamTracks();
  }, [stopStreamTracks]);

  const requestCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('denied');
      return;
    }

    const requestId = ++requestSeqRef.current;
    setStatus('pending');
    setVideoReady(false);
    stopStreamTracks();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (requestId !== requestSeqRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      autoRetriedRef.current = false;
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setStatus('active');

      const video = videoRef.current;
      if (video) {
        attachStreamToVideo(video, mediaStream);
      }
    } catch (error) {
      if (requestId !== requestSeqRef.current) return;

      if (isPermissionDeniedError(error)) {
        setStatus('denied');
        return;
      }

      // Strict Mode unmount/remount can interrupt the first request — retry once.
      if (!autoRetriedRef.current) {
        autoRetriedRef.current = true;
        window.setTimeout(() => {
          if (requestId !== requestSeqRef.current) return;
          void requestCamera();
        }, 300);
        return;
      }

      setStatus('denied');
    }
  }, [stopStreamTracks]);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const activeStream = streamRef.current;
    if (!video || !activeStream || status !== 'active') return;
    attachStreamToVideo(video, activeStream);
  }, [status, stream]);

  useEffect(() => {
    void requestCamera();
    return () => {
      releaseCamera();
    };
  }, [releaseCamera, requestCamera]);

  return {
    videoRef,
    bindVideoElement,
    status,
    stream,
    videoReady,
    markVideoReady,
    requestCamera,
    releaseCamera,
  };
}
