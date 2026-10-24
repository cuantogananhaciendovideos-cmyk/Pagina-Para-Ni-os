/**
 * Universal Camera & Microphone Service
 * Compatible with all major browsers: Chrome, Safari (macOS & iOS/iPadOS), Firefox, Edge, Android Chrome, and iframes.
 * Respects strict user-gesture policies and provides multi-tiered constraint fallbacks.
 */

export interface UniversalMediaOptions {
  video: boolean;
  audio: boolean;
  facingMode?: 'user' | 'environment';
  idealWidth?: number;
  idealHeight?: number;
}

export interface UniversalMediaResult {
  stream: MediaStream;
  hasVideo: boolean;
  hasAudio: boolean;
  warning?: string;
}

export class UniversalCameraService {
  /**
   * Check if getUserMedia is supported in the current environment
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    // getUserMedia is restricted to secure contexts by modern browsers (HTTPS or localhost).
    if (window.isSecureContext === false) return false;
    return !!(
      (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia
    );
  }

  /**
   * Query current permission status if supported (Chrome/Firefox/Edge)
   */
  static async queryCameraPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'camera' as any });
        return status.state;
      }
    } catch {
      // Safari and older browsers throw when querying 'camera'
    }
    return 'unknown';
  }

  /**
   * Universal acquisition of camera and/or microphone stream with progressive fallbacks
   */
  static async requestMediaStream(options: UniversalMediaOptions): Promise<UniversalMediaResult> {
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      throw new Error(
        'Por seguridad, el navegador solo permite usar la cámara en una página HTTPS o en localhost. Abre esta página con HTTPS y vuelve a intentarlo.'
      );
    }

    if (!this.isSupported()) {
      throw new Error(
        'Este navegador no ofrece acceso compatible a la cámara. Actualiza Chrome, Safari, Firefox o Edge y abre la página mediante HTTPS.'
      );
    }

    const getUserMediaFn = (constraints: MediaStreamConstraints): Promise<MediaStream> => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
      }

      // Legacy fallback for older WebKit / Gecko
      const legacyFn =
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;

      if (legacyFn) {
        return new Promise((resolve, reject) => {
          legacyFn.call(navigator, constraints, resolve, reject);
        });
      }

      return Promise.reject(new Error('getUserMedia not implemented'));
    };

    // If only audio is requested
    if (!options.video) {
      const audioStream = await getUserMediaFn({ audio: true, video: false });
      return {
        stream: audioStream,
        hasVideo: false,
        hasAudio: audioStream.getAudioTracks().length > 0,
      };
    }

    // Constraint candidates in descending order of strictness
    const candidates: MediaStreamConstraints[] = [];

    // 1. Specific facing mode + resolution
    if (options.idealWidth && options.idealHeight) {
      candidates.push({
        audio: options.audio,
        video: {
          facingMode: options.facingMode || 'user',
          width: { ideal: options.idealWidth },
          height: { ideal: options.idealHeight },
        },
      });
    }

    // 2. Specific facing mode without exact resolution
    candidates.push({
      audio: options.audio,
      video: {
        facingMode: options.facingMode || 'user',
      },
    });

    // 3. Simple video and audio boolean
    candidates.push({
      audio: options.audio,
      video: true,
    });

    // 4. Video ONLY (in case microphone is in use or blocked)
    if (options.audio) {
      candidates.push({
        audio: false,
        video: true,
      });
    }

    let lastError: any = null;
    for (const constraints of candidates) {
      try {
        const stream = await getUserMediaFn(constraints);
        if (stream) {
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();

          // If user asked for audio but we had to fallback to video only
          let warning: string | undefined;
          if (options.audio && audioTracks.length === 0) {
            warning = 'El micrófono no estuvo disponible, pero la cámara sí está activa 📷.';
          }

          return {
            stream,
            hasVideo: videoTracks.length > 0,
            hasAudio: audioTracks.length > 0,
            warning,
          };
        }
      } catch (err: any) {
        lastError = err;
        // If user explicitly denied permission, do not keep trying narrower constraints
        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError' ||
          err.message?.toLowerCase().includes('denied')
        ) {
          break;
        }
      }
    }

    // 5. If video completely failed (e.g. webcam in use by another tab), try audio fallback
    if (options.audio) {
      try {
        const audioFallbackStream = await getUserMediaFn({ audio: true, video: false });
        if (audioFallbackStream) {
          return {
            stream: audioFallbackStream,
            hasVideo: false,
            hasAudio: true,
            warning: 'Cámara ocupada o no disponible. Continuando la llamada con audio 🎙️',
          };
        }
      } catch {
        // ignore audio fallback failure, throw original error
      }
    }

    // Translate common browser errors to friendly, actionable messages
    const errName = lastError?.name || '';
    const errMessage = lastError?.message || '';

    if (
      errName === 'NotAllowedError' ||
      errName === 'PermissionDeniedError' ||
      errMessage.toLowerCase().includes('denied') ||
      errMessage.toLowerCase().includes('permission')
    ) {
      throw new Error(
        'El navegador bloqueó la cámara. Haz clic en el candado 🔒 o ícono de cámara 📷 en la barra de direcciones de tu navegador y selecciona "Permitir".'
      );
    }

    if (errName === 'NotReadableError' || errName === 'TrackStartError') {
      throw new Error(
        'La cámara está ocupada por otra pestaña o aplicación. Cierra cualquier otra app de videollamada y pulsa Reintentar.'
      );
    }

    if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
      throw new Error('No se detectó ninguna cámara o micrófono conectado en este dispositivo.');
    }

    throw new Error(lastError?.message || 'No se pudo activar la cámara o el micrófono.');
  }

  /**
   * Safely bind a stream to an HTMLVideoElement adhering to Safari/iOS/Chrome policies
   */
  static bindStreamToVideo(
    videoEl: HTMLVideoElement | null,
    stream: MediaStream | null,
    muted = true
  ): void {
    if (!videoEl) return;

    if (!stream) {
      videoEl.srcObject = null;
      return;
    }

    // Required flags for iOS Safari inline playback & autoplay
    videoEl.muted = muted;
    videoEl.defaultMuted = muted;
    videoEl.playsInline = true;
    videoEl.setAttribute('playsinline', 'true');
    videoEl.setAttribute('webkit-playsinline', 'true');
    videoEl.setAttribute('autoplay', 'true');

    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }

    const tryPlay = () => {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Play was prevented, waiting for user gesture or loaded metadata
        });
      }
    };

    if (videoEl.readyState >= 2) {
      tryPlay();
    } else {
      videoEl.onloadedmetadata = () => {
        tryPlay();
      };
    }
  }

  /**
   * Safely stop all tracks on a MediaStream
   */
  static stopStream(stream: MediaStream | null | undefined): void {
    if (!stream) return;
    try {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
  }
}
