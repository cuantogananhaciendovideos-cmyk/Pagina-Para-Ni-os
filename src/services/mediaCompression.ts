/**
 * Open Source Client-Side Media Compression & Recording Engine
 * Uses 100% native Web Standards (MediaRecorder, Canvas, Web Audio API)
 * Optimizes videos, audio notes, and photos to ultra-lightweight sizes (< 500KB)
 */

export interface CompressionResult {
  dataUrl: string;
  sizeKb: number;
  originalSizeKb: number;
  duration?: number;
}

/**
 * Compresses an image file or DataURL using HTML5 Canvas
 */
export async function compressImage(
  source: File | Blob | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.72
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let originalSizeKb = 0;
    if (typeof source !== 'string') {
      originalSizeKb = Math.round(source.size / 1024);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // WebP preferred for supreme compression, fallback to JPEG
      const mime = 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(mime, quality);
      const approxSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

      resolve({
        dataUrl: compressedDataUrl,
        sizeKb: approxSizeKb,
        originalSizeKb: originalSizeKb || approxSizeKb,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Checks supported mime types for recording
 */
function getSupportedMimeType(types: string[]): string {
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

/**
 * Voice Recorder with client-side audio compression
 */
export class VoiceRecorderController {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;

  async start(): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const preferredTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    const mimeType = getSupportedMimeType(preferredTypes);

    const options: MediaRecorderOptions = {
      audioBitsPerSecond: 32000, // 32 kbps is lightweight and great for voice
    };
    if (mimeType) {
      options.mimeType = mimeType;
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(200); // 200ms slice
  }

  async stop(): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not active'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const durationSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.chunks, { type: mimeType });
        const originalSizeKb = Math.round(blob.size / 1024);

        // Convert to dataUrl for persistence & transmission
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          this.cleanup();
          resolve({
            dataUrl,
            sizeKb,
            originalSizeKb,
            duration: durationSec,
          });
        };
        reader.onerror = () => {
          this.cleanup();
          reject(new Error('Failed to read recorded audio'));
        };
        reader.readAsDataURL(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }
}

/**
 * Video Clip Recorder with client-side compression
 */
export class VideoClipRecorderController {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;

  async start(videoElement?: HTMLVideoElement, existingStream?: MediaStream): Promise<MediaStream> {
    this.chunks = [];
    if (existingStream && existingStream.active && existingStream.getVideoTracks().length > 0) {
      this.stream = existingStream;
    } else {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 480 },
            height: { ideal: 480 },
            frameRate: { ideal: 24, max: 24 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch {
        // Fallback to basic constraints if ideal fails
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }
    }

    if (videoElement && this.stream) {
      videoElement.srcObject = this.stream;
      videoElement.muted = true;
      videoElement.setAttribute('playsinline', 'true');
      videoElement.play().catch(() => {});
    }

    const preferredTypes = [
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    const mimeType = getSupportedMimeType(preferredTypes);

    const options: MediaRecorderOptions = {
      videoBitsPerSecond: 450000, // 450 kbps keeps 10-sec clip to ~300-500KB
      audioBitsPerSecond: 32000,
    };
    if (mimeType) {
      options.mimeType = mimeType;
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(250);
    return this.stream;
  }

  async stop(): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Video recorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const durationSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.chunks, { type: mimeType });
        const originalSizeKb = Math.round(blob.size / 1024);

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          this.cleanup();
          resolve({
            dataUrl,
            sizeKb,
            originalSizeKb,
            duration: durationSec,
          });
        };
        reader.onerror = () => {
          this.cleanup();
          reject(new Error('Failed to read recorded video'));
        };
        reader.readAsDataURL(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }
}
