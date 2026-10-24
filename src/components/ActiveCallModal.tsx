import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  Smile,
  Volume2,
  X,
  Maximize2,
  Heart,
  Crown,
  Glasses,
  Flower2,
  Radio,
  AlertTriangle,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { AnimalAvatar } from '../types';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';
import { webrtcService, CallType } from '../services/webrtcService';
import { UniversalCameraService } from '../services/universalCamera';

export type { CallType };

interface ActiveCallModalProps {
  isOpen: boolean;
  callType: CallType;
  friendName: string;
  friendAvatar: AnimalAvatar;
  childName: string;
  childAvatar: AnimalAvatar;
  calleeId?: string;
  callerId?: string;
  callId?: string;
  isIncoming?: boolean;
  onClose: (durationSec: number, callType: CallType) => void;
}

type FunFilter = 'none' | 'crown' | 'cat' | 'glasses' | 'flowers' | 'stars';

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  isOpen,
  callType,
  friendName,
  friendAvatar,
  childName,
  childAvatar,
  calleeId,
  callerId,
  callId,
  isIncoming = false,
  onClose,
}) => {
  const [callState, setCallState] = useState<'calling' | 'connected'>('calling');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(callType === 'voice');
  const [activeFilter, setActiveFilter] = useState<FunFilter>('none');
  const [durationSec, setDurationSec] = useState(0);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [isWebRTCConnected, setIsWebRTCConnected] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [showSimulateBtn, setShowSimulateBtn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const callingVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const ringtoneIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const simulationPromptTimeoutRef = useRef<any>(null);

  // Progressive camera and microphone stream acquisition using UniversalCameraService
  const acquireMediaStream = async (): Promise<MediaStream> => {
    const isVideo = callType === 'video' && !isVideoDisabled;
    const result = await UniversalCameraService.requestMediaStream({
      video: isVideo,
      audio: true,
      facingMode: 'user',
      idealWidth: 640,
      idealHeight: 480,
    });
    if (result.warning) {
      setCameraNotice(result.warning);
    }
    if (!result.hasVideo && callType === 'video') {
      setIsVideoDisabled(true);
    }
    return result.stream;
  };

  // Explicit user-gesture handler that satisfies strict browser policies (Safari, Chrome, Firefox)
  const handleUserGestureActivateCamera = async () => {
    sounds.playPop();
    try {
      setCameraError(null);
      setCameraNotice(null);
      const result = await UniversalCameraService.requestMediaStream({
        video: true,
        audio: true,
        facingMode: 'user',
        idealWidth: 640,
        idealHeight: 480,
      });
      localStreamRef.current = result.stream;
      setIsCameraReady(result.hasVideo);
      setIsVideoDisabled(!result.hasVideo);
      if (result.warning) {
        setCameraNotice(result.warning);
      }
      webrtcService.updateLocalStream(result.stream);
      setupAudioAnalyser(result.stream, setMicAudioLevel);

      if (callingVideoRef.current) {
        UniversalCameraService.bindStreamToVideo(callingVideoRef.current, result.stream, true);
      }
      if (localVideoRef.current) {
        UniversalCameraService.bindStreamToVideo(localVideoRef.current, result.stream, true);
      }
    } catch (err: any) {
      setCameraError(err.message || 'No se pudo acceder a la cámara en este navegador.');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupCall();
      return;
    }

    setCallState('calling');
    setDurationSec(0);
    setIsMicMuted(false);
    setIsVideoDisabled(callType === 'voice');
    setActiveFilter('none');
    setIsWebRTCConnected(false);
    setHasRemoteVideo(false);
    setShowSimulateBtn(false);
    setCameraError(null);
    setCameraNotice(null);
    setIsCameraReady(false);

    // Outgoing ringing audio
    if (!isIncoming) {
      sounds.playRingtone();
      ringtoneIntervalRef.current = setInterval(() => {
        sounds.playRingtone();
      }, 2200);
    }

    // Offer simulation button after 4.5s if peer is offline / testing alone
    simulationPromptTimeoutRef.current = setTimeout(() => {
      setShowSimulateBtn(true);
    }, 4500);

    // Initialize Local Media & WebRTC Signaling
    const initCall = async () => {
      try {
        setCameraError(null);
        const stream = await acquireMediaStream();
        localStreamRef.current = stream;
        const videoTracks = stream.getVideoTracks();
        setIsCameraReady(videoTracks.length > 0 && !isVideoDisabled);

        // Setup real-time audio reactivity for local mic
        setupAudioAnalyser(stream, setMicAudioLevel);

        const handleRemoteStream = (rStream: MediaStream) => {
          remoteStreamRef.current = rStream;
          const rVideoTracks = rStream.getVideoTracks();
          setHasRemoteVideo(rVideoTracks.length > 0);
          setupAudioAnalyser(rStream, setRemoteAudioLevel);
          if (remoteVideoRef.current) {
            UniversalCameraService.bindStreamToVideo(remoteVideoRef.current, rStream, false);
          }
        };

        const handleCallConnected = () => {
          if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
          sounds.playCallConnected();
          setCallState('connected');
          setIsWebRTCConnected(true);

          if (!timerIntervalRef.current) {
            timerIntervalRef.current = setInterval(() => {
              setDurationSec((prev) => prev + 1);
            }, 1000);
          }
        };

        const handleCallEnded = () => {
          handleHangUp();
        };

        // Real WebRTC P2P initiation
        if (isIncoming && callId) {
          await webrtcService.answerCall({
            callId,
            localStream: stream,
            onRemoteStream: handleRemoteStream,
            onCallConnected: handleCallConnected,
            onCallEnded: handleCallEnded,
          });
        } else {
          await webrtcService.startCall({
            callerId: callerId || 'user-local',
            callerName: childName,
            callerAvatar: childAvatar,
            calleeId: calleeId || 'user-remote',
            calleeName: friendName,
            calleeAvatar: friendAvatar,
            type: callType,
            localStream: stream,
            onRemoteStream: handleRemoteStream,
            onCallConnected: handleCallConnected,
            onCallEnded: handleCallEnded,
          });
        }
      } catch (err: any) {
        console.warn('WebRTC local media error:', err);
        setCameraError(
          err.message || 'Permiso de cámara no concedido en el navegador.'
        );
      }
    };

    initCall();

    return () => {
      cleanupCall();
    };
  }, [isOpen, callType, isIncoming, callId]);

  // Continuously attach local media to local video elements whenever they are rendered
  useEffect(() => {
    const stream = localStreamRef.current;
    if (!stream || isVideoDisabled) return;

    if (localVideoRef.current) {
      UniversalCameraService.bindStreamToVideo(localVideoRef.current, stream, true);
    }

    if (callingVideoRef.current) {
      UniversalCameraService.bindStreamToVideo(callingVideoRef.current, stream, true);
    }
  });

  // Continuously attach remote media to remote video element whenever it is rendered
  useEffect(() => {
    const video = remoteVideoRef.current;
    const stream = remoteStreamRef.current;
    if (video && stream) {
      UniversalCameraService.bindStreamToVideo(video, stream, false);
    }
  });

  const setupAudioAnalyser = (stream: MediaStream, setLevel: (val: number) => void) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const checkAudio = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setLevel(Math.min(100, Math.round((avg / 128) * 100)));
        }
        animFrameRef.current = requestAnimationFrame(checkAudio);
      };
      checkAudio();
    } catch {
      // AudioContext fallback
    }
  };

  const cleanupCall = () => {
    if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (simulationPromptTimeoutRef.current) clearTimeout(simulationPromptTimeoutRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if ((window as any).__cluky_sim_interval) {
      clearInterval((window as any).__cluky_sim_interval);
      (window as any).__cluky_sim_interval = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    webrtcService.cleanup();
  };

  const handleHangUp = () => {
    sounds.playCallEnd();
    const finalSec = durationSec;
    webrtcService.endCall();
    cleanupCall();
    onClose(finalSec, callType);
  };

  // Allows instant testing when caller is alone without a second test device
  const handleConnectSimulatedFriend = () => {
    sounds.playCallConnected();
    if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    setCallState('connected');
    setIsWebRTCConnected(true);
    if (!timerIntervalRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);
    }

    // Generate animated video feed for simulated test mode
    if (callType === 'video') {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        let frame = 0;
        const drawSimulatedFriend = () => {
          if (!ctx) return;
          frame++;
          // Space/gradient background
          const grad = ctx.createLinearGradient(0, 0, 640, 480);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(0.5, '#431407');
          grad.addColorStop(1, '#312e81');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 640, 480);

          // Star particles
          for (let i = 0; i < 15; i++) {
            const sx = (i * 47 + frame * 0.8) % 640;
            const sy = (i * 31 + Math.sin(frame * 0.05 + i) * 20) % 480;
            ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#c084fc';
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Bouncing friend circle
          const bounce = Math.sin(frame * 0.12) * 15;
          ctx.beginPath();
          ctx.arc(320, 220 + bounce, 95, 0, Math.PI * 2);
          ctx.fillStyle = '#fce7f3';
          ctx.fill();
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#ec4899';
          ctx.stroke();

          // Cute animal face (ears, eyes, cheeks, smile)
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(260, 150 + bounce, 28, 0, Math.PI * 2);
          ctx.arc(380, 150 + bounce, 28, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(285, 205 + bounce, 9, 0, Math.PI * 2);
          ctx.arc(355, 205 + bounce, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(270, 225 + bounce, 12, 0, Math.PI * 2);
          ctx.arc(370, 225 + bounce, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(320, 230 + bounce, 22, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#9d174d';
          ctx.stroke();

          // Friendly label
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(160, 340, 320, 48);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🎉 ${friendName} en vivo (Prueba)`, 320, 372);
        };

        const interval = setInterval(drawSimulatedFriend, 40);
        (window as any).__cluky_sim_interval = interval;
        const simStream = canvas.captureStream ? canvas.captureStream(25) : null;
        if (simStream) {
          remoteStreamRef.current = simStream;
          setHasRemoteVideo(true);
        }
      } catch (err) {
        console.warn('Canvas simulation not supported:', err);
      }
    }
  };

  const toggleMic = () => {
    sounds.playPop();
    const nextState = !isMicMuted;
    setIsMicMuted(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextState;
      });
    }
  };

  const toggleVideo = async () => {
    sounds.playPop();
    const nextState = !isVideoDisabled;
    setIsVideoDisabled(nextState);

    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((t) => (t.enabled = !nextState));
        setIsCameraReady(!nextState);
      } else if (!nextState) {
        try {
          const res = await UniversalCameraService.requestMediaStream({
            video: true,
            audio: false,
            facingMode: 'user',
            idealWidth: 640,
            idealHeight: 480,
          });
          const newTrack = res.stream.getVideoTracks()[0];
          if (newTrack) {
            localStreamRef.current.addTrack(newTrack);
            setIsCameraReady(true);
            webrtcService.updateLocalStream(localStreamRef.current);
            UniversalCameraService.bindStreamToVideo(localVideoRef.current, localStreamRef.current, true);
          }
        } catch {
          // ignore
        }
      }
    } else if (!nextState) {
      handleUserGestureActivateCamera();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl h-[calc(100dvh-1rem)] sm:h-[min(86vh,680px)] max-h-[680px] bg-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-purple-400 overflow-hidden flex flex-col">
        {/* Header bar */}
        <div className="px-3 py-2.5 sm:px-5 sm:py-3.5 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-purple-500/30 rounded-2xl shrink-0">
              {callType === 'video' ? (
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
              ) : (
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5 sm:gap-2 truncate">
                <span>{callType === 'video' ? 'Videollamada en Vivo 📹' : 'Llamada de Voz 📞'}</span>
                {callState === 'connected' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                )}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                {callState === 'calling'
                  ? `Llamando a ${friendName}...`
                  : `Conectado con ${friendName} • ${formatTimer(durationSec)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/70 text-emerald-300 border border-emerald-600/50 rounded-full text-[10px] sm:text-xs font-bold">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="hidden xs:inline">WebRTC</span>
            </div>
            <button
              onClick={handleHangUp}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-700/80 transition text-slate-300 cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Call Main Stage */}
        <div className="flex-1 min-h-0 relative bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Background sparkles */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px]"></div>

          {/* CALLING STATE: Ringing screen */}
          {callState === 'calling' ? (
            <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 z-10 w-full max-w-lg h-full overflow-y-auto">
              {/* Permission / camera error notification banner with 1-tap activation */}
              {cameraError && (
                <div className="w-full p-2.5 sm:p-3 bg-amber-500/20 border-2 border-amber-400/80 rounded-2xl text-amber-200 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-left min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{cameraError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUserGestureActivateCamera}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-xl text-[11px] shrink-0 cursor-pointer shadow-md"
                  >
                    Permitir Cámara
                  </button>
                </div>
              )}

              {cameraNotice && (
                <div className="w-full p-2 bg-blue-500/20 border border-blue-400/60 rounded-2xl text-blue-200 text-xs font-semibold text-center">
                  {cameraNotice}
                </div>
              )}

              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                {/* Friend Avatar */}
                <div className="relative flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 -m-3 sm:-m-4 rounded-full bg-purple-500/20 animate-ping"></div>
                    <div className="absolute inset-0 -m-1 sm:-m-2 rounded-full bg-purple-500/30 animate-pulse"></div>

                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-2 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-2xl flex items-center justify-center">
                      <AnimalAvatarIcon animal={friendAvatar} className="w-16 h-16 sm:w-24 sm:h-24" />
                    </div>
                  </div>
                  <span className="mt-1.5 block text-xs font-bold text-slate-300">{friendName}</span>
                </div>

                {/* Local Video Camera Preview while calling */}
                {callType === 'video' && !isVideoDisabled && (
                  <div className="w-24 h-32 sm:w-32 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-sky-400 shadow-xl relative bg-black flex items-center justify-center">
                    <video
                      ref={callingVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isCameraReady ? 'block' : 'hidden'}`}
                    />
                    {!isCameraReady && (
                      <button
                        type="button"
                        onClick={handleUserGestureActivateCamera}
                        className="p-2 text-center flex flex-col items-center gap-1.5 text-sky-300 hover:text-white transition cursor-pointer"
                        title="Tocar para activar cámara"
                      >
                        <Camera className="w-8 h-8 animate-pulse text-sky-400" />
                        <span className="text-[10px] font-black leading-tight bg-sky-500/30 px-2 py-1 rounded-lg">
                          Tocar para Activar Cámara 📷
                        </span>
                      </button>
                    )}
                    {isCameraReady && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/75 rounded-full text-[9px] font-bold text-white whitespace-nowrap">
                        Tu Cámara 📷
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg sm:text-2xl font-black text-white">Llamando a {friendName}...</h4>
                <p className="text-xs sm:text-sm text-purple-200 mt-0.5 animate-pulse">
                  Esperando respuesta de tu amigo 🎶
                </p>
              </div>

              {/* Simulation fallback button if testing alone */}
              {showSimulateBtn && (
                <button
                  type="button"
                  onClick={handleConnectSimulatedFriend}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 transition active:scale-95 animate-bounce cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>¿Estás probando solo? Conectar llamada de prueba</span>
                </button>
              )}
            </div>
          ) : (
            /* CONNECTED STATE */
            <div className="w-full h-full flex flex-col items-center justify-center relative min-h-0">
              {/* Real Remote Video Feed (if callee enabled camera) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full max-h-full object-contain sm:object-cover rounded-2xl shadow-2xl ${
                  hasRemoteVideo && callType === 'video' ? 'block' : 'hidden'
                }`}
              />

              {/* Friend's Avatar Stage (when audio-only or camera off) */}
              {(!hasRemoteVideo || callType === 'voice') && (
                <div className="flex flex-col items-center justify-center w-full max-w-md py-2 sm:py-4">
                  <div className="relative">
                    <div
                      className="absolute inset-0 -m-3 sm:-m-4 rounded-full border-4 border-emerald-400/60 transition-all duration-150"
                      style={{
                        transform: `scale(${1 + Math.min(0.35, (remoteAudioLevel || micAudioLevel) / 120)})`,
                        opacity: isMicMuted ? 0.2 : Math.max(0.3, (remoteAudioLevel || micAudioLevel) / 80),
                      }}
                    ></div>

                    <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-3xl p-2.5 sm:p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-2xl flex items-center justify-center border-4 border-white/20">
                      <AnimalAvatarIcon animal={friendAvatar} className="w-20 h-20 sm:w-32 sm:h-32" />

                      {/* AR Filters */}
                      {activeFilter === 'crown' && (
                        <div className="absolute -top-6 sm:-top-7 animate-bounce">
                          <Crown className="w-9 h-9 sm:w-12 sm:h-12 text-amber-300 fill-amber-300 drop-shadow-lg" />
                        </div>
                      )}
                      {activeFilter === 'cat' && (
                        <div className="absolute -top-3 text-2xl sm:text-3xl animate-pulse">🐱</div>
                      )}
                      {activeFilter === 'glasses' && (
                        <div className="absolute top-9 sm:top-12 text-2xl sm:text-3xl">😎</div>
                      )}
                      {activeFilter === 'flowers' && (
                        <div className="absolute -top-5 text-2xl sm:text-3xl animate-bounce">🌸💐🌸</div>
                      )}
                      {activeFilter === 'stars' && (
                        <div className="absolute -top-5 text-xl sm:text-2xl animate-spin">⭐✨⭐</div>
                      )}
                    </div>

                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-600 text-white text-[11px] sm:text-xs font-black rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      {friendName}
                    </div>
                  </div>

                  {/* Audio Waves */}
                  <div className="flex items-center gap-1 h-6 sm:h-8 mt-4 sm:mt-6">
                    {[25, 60, 40, 85, 30, 95, 55, 75, 35, 90, 45, 65].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-pink-400 transition-all duration-100"
                        style={{
                          height: `${Math.max(20, Math.min(100, h * (0.4 + (remoteAudioLevel || micAudioLevel) / 70)))}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Real Local Video Preview (Picture in Picture) */}
              {callType === 'video' && !isVideoDisabled && (
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-24 h-32 sm:w-36 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-400 bg-black/90 group z-20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isCameraReady ? 'block' : 'hidden'}`}
                  />
                  {!isCameraReady && (
                    <button
                      type="button"
                      onClick={handleUserGestureActivateCamera}
                      className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-sky-300 hover:text-white cursor-pointer"
                      title="Activar cámara"
                    >
                      <Camera className="w-6 h-6 animate-pulse text-sky-400 mb-1" />
                      <span className="text-[9px] font-bold">Activar Cámara</span>
                    </button>
                  )}
                  {isCameraReady && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/60 rounded-full text-[9px] font-bold text-white backdrop-blur-xs">
                      Tú ({childName})
                    </div>
                  )}

                  {activeFilter === 'crown' && (
                    <div className="absolute top-2 right-2">
                      <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
                    </div>
                  )}
                  {activeFilter === 'cat' && (
                    <div className="absolute top-2 right-2 text-base">🐱</div>
                  )}
                  {activeFilter === 'glasses' && (
                    <div className="absolute top-2 right-2 text-base">👓</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fun Filter Picker Dropdown */}
        {showFilterPicker && callState === 'connected' && (
          <div className="px-3 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] sm:text-xs font-bold text-purple-300 mr-1 shrink-0">Filtros:</span>
            {[
              { id: 'none', label: 'Sin Filtro', icon: '❌' },
              { id: 'crown', label: 'Corona', icon: '👑' },
              { id: 'cat', label: 'Gatito', icon: '🐱' },
              { id: 'glasses', label: 'Gafas', icon: '🕶️' },
              { id: 'flowers', label: 'Flores', icon: '🌸' },
              { id: 'stars', label: 'Estrellas', icon: '⭐' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setActiveFilter(f.id as FunFilter);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                  activeFilter === f.id
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Call Action Controls (Guaranteed visible across mobile, tablet, and desktop) */}
        <div className="p-2.5 sm:p-3.5 bg-slate-800/95 border-t border-slate-700/80 flex items-center justify-center gap-2.5 sm:gap-4 shrink-0">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 sm:p-3.5 rounded-full font-bold shadow-lg transition active:scale-90 cursor-pointer ${
              isMicMuted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title={isMicMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
          >
            {isMicMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Video Toggle */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`p-2.5 sm:p-3.5 rounded-full font-bold shadow-lg transition active:scale-90 cursor-pointer ${
              isVideoDisabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title={isVideoDisabled ? 'Encender cámara' : 'Apagar cámara'}
          >
            {isVideoDisabled ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Fun Filters Button */}
          {callState === 'connected' && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setShowFilterPicker((prev) => !prev);
              }}
              className={`p-2.5 sm:p-3.5 rounded-full font-bold shadow-lg transition active:scale-90 cursor-pointer ${
                showFilterPicker || activeFilter !== 'none'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title="Filtros Mágicos Divertidos"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Hang Up Button */}
          <button
            type="button"
            onClick={handleHangUp}
            className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition active:scale-95 animate-pulse cursor-pointer shrink-0"
            title="Colgar llamada"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Colgar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
