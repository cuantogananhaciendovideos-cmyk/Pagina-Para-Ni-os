import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Hands, HandsResults } from '../types/mediapipe';
import { Sparkles, Video, VideoOff, Maximize2, Minimize2, X, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { UniversalCameraService } from '../services/universalCamera';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  symbol: string;
}

export const HandMagicController: React.FC = () => {
  const { isHandModeActive, setHandModeActive } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsInstanceRef = useRef<Hands | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isVideoLoopRunningRef = useRef<boolean>(false);

  // Status & UI
  const [camStatus, setCamStatus] = useState<string>('Iniciando cámara mágica…');
  const [isHandDetected, setIsHandDetected] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [isMouseFallback, setIsMouseFallback] = useState<boolean>(false);

  // Virtual cursor positions (smoothed lerp)
  const targetPosRef = useRef<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const currentPosRef = useRef<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const [cursorVisible, setCursorVisible] = useState<boolean>(false);
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [dwellProgress, setDwellProgress] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Dwell and Pinch tracking refs
  const hoverElemRef = useRef<HTMLElement | null>(null);
  const hoverStartTimeRef = useRef<number>(0);
  const lastPinchTimeRef = useRef<number>(0);
  const isPinchingRef = useRef<boolean>(false);
  const particleIdRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const DWELL_TIME_MS = 700;

  // Trigger click on DOM element under wand tip (ONLY SPURTS STAR PARTICLES ON TOUCH/CLICK)
  const executeMagicClick = useCallback((x: number, y: number, reason: 'dwell' | 'pinch') => {
    // Sound completely disabled as requested

    // Spawn star sparkle particles ONLY when touching/clicking something
    const starSymbols = ['⭐', '✨', '🌟', '💫'];
    const burstColors = ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#38BDF8', '#FBBF24'];
    const newSparkles: Particle[] = [];

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 + (Math.random() - 0.5) * 0.3;
      const dist = 14 + Math.random() * 26;
      newSparkles.push({
        id: ++particleIdRef.current,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        color: burstColors[i % burstColors.length],
        size: 14 + Math.random() * 10,
        life: 1,
        symbol: starSymbols[i % starSymbols.length],
      });
    }

    setParticles((prev) => [...prev.slice(-16), ...newSparkles]);

    // Find interactive element under the cursor
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return;

    // Find the closest clickable target
    const clickable = el.closest<HTMLElement>(
      'button, a, input, select, textarea, [role="button"], [tabindex], .cursor-pointer, [data-clickable]'
    ) || el;

    if (clickable) {
      clickable.focus();
      clickable.click();

      // Dispatch simulated mouse events for game canvases and custom components
      const mouseEventInit: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        view: window,
      };
      clickable.dispatchEvent(new MouseEvent('mousedown', mouseEventInit));
      clickable.dispatchEvent(new MouseEvent('mouseup', mouseEventInit));
      clickable.dispatchEvent(new MouseEvent('click', mouseEventInit));

      // Visual pulse on element
      clickable.classList.add('ring-4', 'ring-amber-400', 'transition-all');
      setTimeout(() => {
        clickable.classList.remove('ring-4', 'ring-amber-400');
      }, 350);
    }
  }, []);

  // Mouse & Touch fallback listeners: if camera is not active or hand not detected, wand smoothly follows pointer
  useEffect(() => {
    if (!isHandModeActive) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (isMouseFallback || !isHandDetected) {
        targetPosRef.current.x = e.clientX;
        targetPosRef.current.y = e.clientY;
        setCursorVisible(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if ((isMouseFallback || !isHandDetected) && e.touches.length > 0) {
        targetPosRef.current.x = e.touches[0].clientX;
        targetPosRef.current.y = e.touches[0].clientY;
        setCursorVisible(true);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isHandModeActive, isMouseFallback, isHandDetected]);

  // Main animation and kinematic smoothing loop
  useEffect(() => {
    if (!isHandModeActive) return;

    const wandEl = document.getElementById('clayckey-magic-wand-cursor');

    const updateLoop = () => {
      // Kinematic smoothing (LERP) factor: 0.28 delivers a smooth, non-jittery glide
      const smoothingFactor = 0.28;
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * smoothingFactor;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * smoothingFactor;

      const px = currentPosRef.current.x;
      const py = currentPosRef.current.y;

      if (wandEl) {
        wandEl.style.transform = `translate(${px}px, ${py}px)`;
        wandEl.style.opacity = cursorVisible ? '1' : '0';
      }

      // Fade out star particles created when clicking/touching
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, life: p.life - 0.04 }))
          .filter((p) => p.life > 0)
      );

      // Check element hover and dwell click
      const now = performance.now();
      if (cursorVisible) {
        const topEl = document.elementFromPoint(px, py) as HTMLElement | null;
        const clickable = topEl
          ? topEl.closest<HTMLElement>(
              'button, a, input, select, textarea, [role="button"], [tabindex], .cursor-pointer'
            )
          : null;

        if (clickable) {
          if (hoverElemRef.current !== clickable) {
            hoverElemRef.current = clickable;
            hoverStartTimeRef.current = now;
            setDwellProgress(0);
          } else {
            const elapsed = now - hoverStartTimeRef.current;
            const progress = Math.min(1, elapsed / DWELL_TIME_MS);
            setDwellProgress(progress);

            if (progress >= 1) {
              // Dwell reached 100%! Click!
              executeMagicClick(px, py, 'dwell');
              hoverStartTimeRef.current = now + 400; // Pause briefly before next dwell
              setDwellProgress(0);
            }
          }
        } else {
          hoverElemRef.current = null;
          setDwellProgress(0);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isHandModeActive, cursorVisible, executeMagicClick]);

  // Clean media stream stop helper
  const stopMediaStream = useCallback(() => {
    isVideoLoopRunningRef.current = false;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Universal Resilient Camera Acquisition for Any Browser (Chrome, Safari, Firefox, Edge, Mobile)
  const startCameraAndDetection = useCallback(async () => {
    setCamStatus('Abriendo cámara mágica…');
    setCameraError(null);
    setIsPermissionDenied(false);

    // Stop existing stream if any
    stopMediaStream();

    // Ensure DOM refs are mounted
    await new Promise((r) => setTimeout(r, 60));

    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoEl || !canvasEl) return;

    try {
      const mediaResult = await UniversalCameraService.requestMediaStream({
        video: true,
        audio: false,
        facingMode: 'user',
        idealWidth: 640,
        idealHeight: 480,
      });

      const stream = mediaResult.stream;
      mediaStreamRef.current = stream;
      UniversalCameraService.bindStreamToVideo(videoEl, stream, true);

      // Setup MediaPipe Hands
      const setupHands = () => {
        if (typeof window.Hands === 'undefined') {
          setTimeout(setupHands, 200);
          return;
        }

        if (!handsInstanceRef.current) {
          const hands = new window.Hands({
            locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
          });

          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          const ctx = canvasEl.getContext('2d');

          hands.onResults((res: HandsResults) => {
            if (!canvasEl || !ctx || !videoEl) return;

            if (videoEl.videoWidth && canvasEl.width !== videoEl.videoWidth) {
              canvasEl.width = videoEl.videoWidth;
              canvasEl.height = videoEl.videoHeight;
            }

            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

            const lm = res.multiHandLandmarks && res.multiHandLandmarks[0];

            if (!lm) {
              setIsHandDetected(false);
              isPinchingRef.current = false;
              setIsPinching(false);
              return;
            }

            setIsHandDetected(true);
            setCursorVisible(true);
            setIsMouseFallback(false);

            // Draw skeleton on the floating HUD preview
            if (window.drawConnectors && window.HAND_CONNECTIONS) {
              window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
                color: '#38BDF8',
                lineWidth: 2,
              });
            }
            if (window.drawLandmarks) {
              window.drawLandmarks(ctx, lm, {
                color: '#F472B6',
                lineWidth: 1,
                radius: 3,
              });
            }

            // Landmark 8 is the tip of the index finger
            const tip = lm[8];
            targetPosRef.current.x = (1 - tip.x) * window.innerWidth;
            targetPosRef.current.y = tip.y * window.innerHeight;

            // Landmark 4 is the tip of the thumb
            const thumb = lm[4];
            const pinchDist = Math.hypot(thumb.x - tip.x, thumb.y - tip.y);
            const pinching = pinchDist < 0.055;

            isPinchingRef.current = pinching;
            setIsPinching(pinching);

            // Draw index point indicator on video HUD
            const px = tip.x * canvasEl.width;
            const py = tip.y * canvasEl.height;

            ctx.beginPath();
            ctx.arc(px, py, pinching ? 12 : 8, 0, Math.PI * 2);
            ctx.fillStyle = pinching ? '#FBBF24' : '#38BDF8';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Instant Pinch Click Gesture 🤏
            if (pinching) {
              const now = performance.now();
              if (now - lastPinchTimeRef.current > 650) {
                lastPinchTimeRef.current = now;
                executeMagicClick(currentPosRef.current.x, currentPosRef.current.y, 'pinch');
              }
            }
          });

          handsInstanceRef.current = hands;
        }

        // Run frame dispatch loop
        isVideoLoopRunningRef.current = true;
        const processFrame = async () => {
          if (!isVideoLoopRunningRef.current) return;
          if (handsInstanceRef.current && videoEl.readyState >= 2) {
            try {
              await handsInstanceRef.current.send({ image: videoEl });
            } catch {
              // ignore
            }
          }
          if (isVideoLoopRunningRef.current) {
            requestAnimationFrame(processFrame);
          }
        };
        requestAnimationFrame(processFrame);
      };

      setupHands();

      setCamStatus('🖐️ ¡Cámara activa! Apunta con tu dedo índice');
      setIsMouseFallback(false);
    } catch (err: any) {
      console.warn('Hand magic camera error:', err);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.message?.toLowerCase().includes('permission') ||
        err?.message?.toLowerCase().includes('denied');

      if (isDenied) {
        setIsPermissionDenied(true);
        setCameraError('Permiso de cámara no concedido en el navegador.');
        setCamStatus('📷 Cámara bloqueada. ¡Usa la varita con el mouse o habilita el permiso!');
      } else {
        setCameraError(err?.message || 'No se pudo abrir la cámara (puede estar ocupada por otra app o pestaña).');
        setCamStatus('✨ Varita mágica activa con mouse o táctil');
      }

      setIsMouseFallback(true);
      setCursorVisible(true);
    }
  }, [executeMagicClick, stopMediaStream]);

  // Main lifecycle for hand mode
  useEffect(() => {
    if (!isHandModeActive) {
      stopMediaStream();
      if (handsInstanceRef.current) {
        try {
          handsInstanceRef.current.close().catch(() => {});
        } catch {
          // ignore
        }
        handsInstanceRef.current = null;
      }
      setCursorVisible(false);
      setIsHandDetected(false);
      setIsMouseFallback(false);
      return;
    }

    startCameraAndDetection();

    return () => {
      stopMediaStream();
      if (handsInstanceRef.current) {
        try {
          handsInstanceRef.current.close().catch(() => {});
        } catch {
          // ignore
        }
        handsInstanceRef.current = null;
      }
    };
  }, [isHandModeActive, startCameraAndDetection, stopMediaStream]);

  if (!isHandModeActive) return null;

  return (
    <>
      {/* ============================================================== */}
      {/* 🪄 VIRTUAL MAGIC WAND CURSOR OVERLAY - NO CIRCLE!              */}
      {/* ============================================================== */}
      <div
        id="clayckey-magic-wand-cursor"
        className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform select-none transition-opacity duration-150"
        style={{
          opacity: cursorVisible ? 1 : 0,
        }}
      >
        <div className="relative -top-2 -left-2 flex items-center justify-center">
          {/* Magic Wand Tip & Icon (Clean, no surrounding circle) */}
          <div
            className={`relative flex items-center justify-center transform transition-transform duration-100 ${
              isPinching ? 'scale-125 rotate-12' : dwellProgress > 0 ? 'scale-115 rotate-6' : 'scale-100 hover:scale-105'
            }`}
          >
            <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.85)]">
              🪄
            </span>
          </div>

          {/* Pinch Indicator Tag */}
          {isPinching && (
            <span className="absolute -bottom-6 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] shadow-md animate-bounce">
              ¡Pellizco 🤏!
            </span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ⭐ STAR SPARKLE PARTICLES (RELEASED ONLY ON TOUCH / CLICK)     */}
      {/* ============================================================== */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-[99998] transition-opacity duration-150 font-black select-none"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            opacity: p.life,
            transform: `translate(-50%, -50%) scale(${0.7 + p.life * 0.6})`,
            color: p.color,
            fontSize: `${p.size}px`,
            textShadow: '0 0 8px rgba(251, 191, 36, 0.85)',
          }}
        >
          {p.symbol}
        </div>
      ))}

      {/* ============================================================== */}
      {/* 📷 WEBCAM / MOUSE MAGIC HUD (Bottom-right)                     */}
      {/* ============================================================== */}
      <div
        className={`fixed z-[9000] bottom-[max(0.5rem,env(safe-area-inset-bottom))] right-[max(0.5rem,env(safe-area-inset-right))] bg-slate-900/95 backdrop-blur-md rounded-3xl border-2 border-indigo-400/60 dark:border-indigo-500/60 shadow-2xl overflow-hidden transition-all duration-300 select-none ${
          isMinimized ? 'w-48 max-w-[calc(100vw-1rem)]' : 'w-72 sm:w-80 max-w-[calc(100vw-1rem)]'
        }`}
      >
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white text-xs font-black">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-base">🪄</span>
            <span className="truncate">
              {isMouseFallback ? 'Varita Mágica (Mouse)' : 'Varita Mágica con Mano'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-white/90"
              title={isMinimized ? 'Expandir' : 'Minimizar'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setHandModeActive(false)}
              className="p-1 rounded-lg hover:bg-rose-500 transition-colors cursor-pointer text-white"
              title="Apagar Modo Mágico"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video / Mirror Container */}
        {!isMinimized && (
          <div className="relative aspect-4/3 bg-black overflow-hidden group">
            {/* Real Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            />
            {/* Real Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
            />

            {/* Hand status indicator tag */}
            {!isPermissionDenied && !cameraError && (
              <>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1 z-10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isHandDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isHandDetected ? 'Mano en pantalla' : 'Buscando mano…'}</span>
                </div>

                <div className="absolute bottom-1 inset-x-2 bg-slate-900/80 backdrop-blur-xs rounded-xl px-2 py-1 text-[10px] text-amber-200 text-center font-bold flex items-center justify-around z-10">
                  <span>☝️ Apunta</span>
                  <span>•</span>
                  <span>⏳ Toca (Estrellitas ⭐)</span>
                  <span>•</span>
                  <span>🤏 Pinza</span>
                </div>
              </>
            )}

            {/* If camera permission is denied or camera is unavailable: Clear guidance & direct user-gesture retry */}
            {(isPermissionDenied || cameraError) && (
              <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center p-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl mb-1.5">
                  📷
                </div>
                <h4 className="text-xs font-black text-white">Permiso de Cámara</h4>
                <p className="text-[10px] text-amber-200/90 mt-1 leading-tight px-1">
                  {isPermissionDenied ? (
                    <>
                      Toca el <strong>candado 🔒</strong> o <strong>cámara 📷</strong> arriba en la barra de tu navegador y elige <strong>"Permitir"</strong>.
                    </>
                  ) : (
                    cameraError
                  )}
                </p>

                <div className="flex flex-col gap-1.5 mt-2.5 w-full max-w-[200px]">
                  <button
                    onClick={startCameraAndDetection}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[11px] font-black cursor-pointer shadow-md transition active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Permitir / Abrir Cámara</span>
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="py-1 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
                  >
                    Usar con Mouse / Minimizar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status bar */}
        <div className="p-2.5 bg-slate-950/90 text-[11px] text-slate-300 flex items-center justify-between">
          <p className="truncate font-semibold text-slate-300">
            <span>{camStatus}</span>
          </p>

          <button
            onClick={() => setHandModeActive(false)}
            className="ml-2 shrink-0 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};
