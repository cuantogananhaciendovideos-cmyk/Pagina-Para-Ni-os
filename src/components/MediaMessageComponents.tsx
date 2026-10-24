import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Video,
  Camera,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Zap,
  Mic,
  Square,
  RefreshCw,
} from 'lucide-react';
import { VideoClipRecorderController, CompressionResult } from '../services/mediaCompression';
import { UniversalCameraService } from '../services/universalCamera';
import { sounds } from '../services/soundEffects';

interface AudioMessageBubbleProps {
  audioUrl: string;
  duration?: number;
  fileSizeKb?: number;
  isMine: boolean;
}

export const AudioMessageBubble: React.FC<AudioMessageBubbleProps> = ({
  audioUrl,
  duration = 0,
  fileSizeKb,
  isMine,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const updateTime = () => setCurrentTime(Math.floor(audio.currentTime));
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    sounds.playPop();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col gap-1.5 my-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition transform active:scale-90 ${
            isMine
              ? 'bg-white text-purple-600 hover:bg-purple-50'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
          title={isPlaying ? 'Pausar audio' : 'Reproducir mensaje de voz'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex-1 flex items-center gap-0.5 h-7 px-1">
          {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 65, 85, 35, 75].map((heightPct, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-200 ${
                isMine ? 'bg-white/80' : 'bg-purple-500/80'
              } ${isPlaying ? 'animate-pulse' : 'opacity-70'}`}
              style={{
                height: isPlaying ? `${Math.max(25, (heightPct * (idx % 2 === 0 ? 1 : 0.7)))}%` : `${heightPct * 0.5}%`,
              }}
            />
          ))}
        </div>

        <span className={`text-xs font-bold shrink-0 ${isMine ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>
          {formatSec(isPlaying ? currentTime : duration || 0)}
        </span>
      </div>

      {/* Compression and Safe Tag */}
      <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-85">
        <span className="flex items-center gap-0.5">
          <Zap className="w-3 h-3 text-amber-300 inline" />
          Voz comprimida {fileSizeKb ? `(${fileSizeKb} KB)` : ''}
        </span>
        <span>•</span>
        <span>Open Source Opus/WebM</span>
      </div>
    </div>
  );
};

interface VideoMessageBubbleProps {
  videoUrl: string;
  duration?: number;
  fileSizeKb?: number;
  isMine: boolean;
}

export const VideoMessageBubble: React.FC<VideoMessageBubbleProps> = ({
  videoUrl,
  duration,
  fileSizeKb,
  isMine,
}) => {
  return (
    <div className="flex flex-col gap-1.5 my-1.5 max-w-xs sm:max-w-sm">
      <div className="relative rounded-2xl overflow-hidden shadow-md bg-black/60 border-2 border-white/20">
        <video
          src={videoUrl}
          controls
          playsInline
          className="w-full max-h-56 object-cover rounded-xl"
        />
        {duration && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm pointer-events-none">
            {duration}s
          </div>
        )}
      </div>

      {/* Compression badge */}
      <div className="flex items-center gap-1 text-[10px] font-semibold opacity-90">
        <Zap className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Mini video comprimido client-side {fileSizeKb ? `(${fileSizeKb} KB)` : ''}</span>
      </div>
    </div>
  );
};

interface MiniVideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVideo: (result: CompressionResult) => void;
}

export const MiniVideoRecorderModal: React.FC<MiniVideoRecorderModalProps> = ({
  isOpen,
  onClose,
  onSendVideo,
}) => {
  const [status, setStatus] = useState<'ready' | 'recording' | 'preview'>('ready');
  const [countdown, setCountdown] = useState(15);
  const [recordedResult, setRecordedResult] = useState<CompressionResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<VideoClipRecorderController | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('ready');
      setRecordedResult(null);
      setCountdown(15);
      setCameraError(null);
      return;
    }

    // Initialize camera preview
    let activeStream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        setCameraError(null);
        recorderRef.current = new VideoClipRecorderController();

        const mediaResult = await UniversalCameraService.requestMediaStream({
          video: true,
          audio: true,
          facingMode: 'user',
          idealWidth: 480,
          idealHeight: 480,
        });

        activeStream = mediaResult.stream;
        if (videoPreviewRef.current) {
          UniversalCameraService.bindStreamToVideo(videoPreviewRef.current, activeStream, true);
        }
      } catch (err: any) {
        setCameraError(err.message || 'No se pudo acceder a la cámara ni al micrófono.');
      }
    };

    initCamera();

    return () => {
      if (activeStream) {
        UniversalCameraService.stopStream(activeStream);
      }
      if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
        UniversalCameraService.stopStream(videoPreviewRef.current.srcObject as MediaStream);
      }
    };
  }, [isOpen]);

  const handleStartRecording = async () => {
    sounds.playPop();
    setCameraError(null);
    try {
      if (!recorderRef.current) {
        recorderRef.current = new VideoClipRecorderController();
      }
      const existingStream = (videoPreviewRef.current?.srcObject as MediaStream) || undefined;
      await recorderRef.current.start(videoPreviewRef.current || undefined, existingStream);
      setStatus('recording');
      setCountdown(15);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setCameraError('Error al iniciar la grabación: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleStopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sounds.playPop();
    try {
      if (recorderRef.current) {
        const result = await recorderRef.current.stop();
        setRecordedResult(result);
        setStatus('preview');
      }
    } catch (err: any) {
      setCameraError('Error al procesar el video comprimido.');
      setStatus('ready');
    }
  };

  const handleRetake = () => {
    sounds.playPop();
    setRecordedResult(null);
    setStatus('ready');
    setCountdown(15);
  };

  const handleConfirmSend = () => {
    if (!recordedResult) return;
    sounds.playStarCelebration();
    onSendVideo(recordedResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-4 border-purple-300 dark:border-purple-600 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6" />
            <h3 className="font-black text-base">Grabar Mini Video Clip 📹</h3>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Viewport */}
        <div className="p-4 flex flex-col items-center">
          {cameraError ? (
            <div className="w-full p-4 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl text-xs font-bold text-center flex flex-col items-center gap-2">
              <span>{cameraError}</span>
              <button
                type="button"
                onClick={async () => {
                  sounds.playPop();
                  setCameraError(null);
                  try {
                    const mediaResult = await UniversalCameraService.requestMediaStream({
                      video: true,
                      audio: true,
                      facingMode: 'user',
                      idealWidth: 480,
                      idealHeight: 480,
                    });
                    if (videoPreviewRef.current) {
                      UniversalCameraService.bindStreamToVideo(videoPreviewRef.current, mediaResult.stream, true);
                    }
                  } catch (err: any) {
                    setCameraError(err.message || 'Error al conectar la cámara.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Permitir / Reintentar Cámara 📷</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden bg-slate-900 shadow-inner border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {/* Live stream preview */}
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${status === 'preview' ? 'hidden' : 'block'}`}
              />

              {/* Recorded preview */}
              {status === 'preview' && recordedResult && (
                <video
                  ref={playbackRef}
                  src={recordedResult.dataUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* Recording Ring & Countdown Badge */}
              {status === 'recording' && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 bg-red-600/90 text-white rounded-full text-xs font-black animate-pulse shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                  GRABANDO {countdown}s
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2 py-1 rounded-xl bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                  ⚡ Compresión Open-Source (450 kbps)
                </span>
                {status === 'preview' && recordedResult && (
                  <span className="px-2 py-1 rounded-xl bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-sm">
                    {recordedResult.sizeKb} KB
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex items-center justify-center gap-3 w-full">
            {status === 'ready' && (
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={!!cameraError}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black text-sm shadow-lg flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                Empezar a Grabar (15s máx)
              </button>
            )}

            {status === 'recording' && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg flex items-center gap-2 transition transform active:scale-95 animate-bounce"
              >
                <Square className="w-5 h-5 fill-current" />
                Terminar Video ({countdown}s)
              </button>
            )}

            {status === 'preview' && (
              <div className="flex items-center gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Grabar de Nuevo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Enviar Video Seguro ✨
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
