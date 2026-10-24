import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ShieldCheck,
  Lock,
  Smile,
  Image as ImageIcon,
  AlertTriangle,
  ArrowLeft,
  MessageCircle,
  Mic,
  Video,
  Square,
  Trash2,
  Zap,
  Camera,
  Phone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { AnimalAvatar, ChatMessage } from '../types';
import { sounds } from '../services/soundEffects';
import { SAFE_STICKERS_GIFS } from '../services/mockData';
import {
  AudioMessageBubble,
  VideoMessageBubble,
  MiniVideoRecorderModal,
} from './MediaMessageComponents';
import {
  VoiceRecorderController,
  compressImage,
  CompressionResult,
} from '../services/mediaCompression';

export const ConversationsView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    childProfile,
    friends,
    currentUser,
    openAuthModal,
    startCallWithFriend,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [mobileScreen, setMobileScreen] = useState<'list' | 'chat'>('chat');

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const voiceControllerRef = useRef<VoiceRecorderController | null>(null);
  const voiceTimerRef = useRef<any>(null);

  // Video recording state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Compression indicator state
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);

  // Hidden file input for compressed photos
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const convMessages = messages.filter((m) => m.conversationId === (activeConv?.id || ''));

  // Clean up voice recorder if component unmounts
  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceControllerRef.current) {
        voiceControllerRef.current.cancel();
      }
    };
  }, []);

  const handleSend = (textToSend?: string, mediaUrl?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() && !mediaUrl) return;

    sounds.playPop();
    const result = sendMessage(activeConv.id, text, mediaUrl, 'text');

    if (result.level === 'red') {
      setWarningMsg('⚠️ El mensaje fue bloqueado por seguridad infantil (Código Rojo).');
      setTimeout(() => setWarningMsg(null), 4000);
    } else {
      setInputText('');
      setShowStickers(false);
    }
  };

  // Start voice recording
  const handleStartVoice = async () => {
    sounds.playPop();
    try {
      const controller = new VoiceRecorderController();
      await controller.start();
      voiceControllerRef.current = controller;
      setIsRecordingVoice(true);
      setVoiceDuration(0);

      voiceTimerRef.current = setInterval(() => {
        setVoiceDuration((prev) => {
          if (prev >= 60) {
            handleStopVoice(true);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setWarningMsg('No se pudo acceder al micrófono. Verifica los permisos de tu navegador.');
      setTimeout(() => setWarningMsg(null), 4000);
    }
  };

  // Stop & compress voice recording client-side
  const handleStopVoice = async (send = true) => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (!voiceControllerRef.current) return;

    if (!send) {
      voiceControllerRef.current.cancel();
      setIsRecordingVoice(false);
      setVoiceDuration(0);
      sounds.playPop();
      return;
    }

    setCompressionStatus('Comprimiendo nota de voz con Opus/WebM...');
    try {
      const result = await voiceControllerRef.current.stop();
      setIsRecordingVoice(false);
      setCompressionStatus(null);
      setVoiceDuration(0);

      sounds.playPop();
      sendMessage(
        activeConv.id,
        '',
        result.dataUrl,
        'voice',
        result.duration,
        result.sizeKb
      );
    } catch (err) {
      setIsRecordingVoice(false);
      setCompressionStatus(null);
      setWarningMsg('Error al comprimir el mensaje de voz.');
      setTimeout(() => setWarningMsg(null), 3000);
    }
  };

  // Send compressed video from modal
  const handleSendVideoClip = (result: CompressionResult) => {
    sendMessage(
      activeConv.id,
      '',
      result.dataUrl,
      'video',
      result.duration,
      result.sizeKb
    );
  };

  // Upload and compress image client-side via Canvas
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playPop();
    setCompressionStatus('⚡ Optimizando y comprimiendo foto con Canvas Open Source...');
    try {
      const result = await compressImage(file, 800, 800, 0.72);
      setCompressionStatus(null);

      sendMessage(
        activeConv.id,
        `[Foto comprimida: ${result.sizeKb} KB]`,
        result.dataUrl,
        'photo',
        0,
        result.sizeKb
      );
    } catch (err) {
      setCompressionStatus(null);
      setWarningMsg('Error al procesar y comprimir la imagen.');
      setTimeout(() => setWarningMsg(null), 3000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden select-none min-h-[min(620px,75dvh)] sm:min-h-[620px]">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              Mensajería Segura para Niños 💬
            </h2>
            <p className="text-xs text-white/90 font-medium">
              Voz • Mini Videos • Fotos Comprimidas • Código Rojo Activo
            </p>
          </div>
        </div>

        {!currentUser && (
          <button
            onClick={() => {
              sounds.playPop();
              openAuthModal('login');
            }}
            className="px-3.5 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-900 rounded-full text-xs font-black shadow-md shadow-sky-400/40 transition active:scale-95 border border-sky-200"
          >
            ✨ Login / Signup
          </button>
        )}
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left conversations list (Responsive: visible on desktop/tablet, toggled on mobile) */}
        <div className={`w-full md:w-72 bg-slate-50 dark:bg-slate-850 border-r border-slate-100 dark:border-slate-700/60 p-3 flex flex-col ${
          mobileScreen === 'chat' ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-1 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Amigos Aprobados ({conversations.length})</span>
            {mobileScreen === 'list' && activeConv && (
              <button
                onClick={() => setMobileScreen('chat')}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 md:hidden"
              >
                Volver al chat →
              </button>
            )}
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    sounds.playPop();
                    setActiveConversationId(conv.id);
                    setMobileScreen('chat');
                  }}
                  className={`w-full p-2.5 rounded-2xl text-left flex items-center gap-3 transition ${
                    isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-400 dark:border-purple-500 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-750 border-2 border-transparent'
                  }`}
                >
                  <AnimalAvatarIcon animal={conv.friendAvatar} className="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800 dark:text-white truncate">
                        {conv.friendName}
                      </span>
                      <span className="text-[10px] text-slate-400">{conv.lastUpdated}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.lastMessage || 'Empieza a platicar...'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right active chat window */}
        {activeConv ? (
          <div className={`flex-1 flex flex-col bg-white dark:bg-slate-800 ${
            mobileScreen === 'list' ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Chat header */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMobileScreen('list');
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 md:hidden cursor-pointer"
                  title="Ver todos los amigos"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <AnimalAvatarIcon animal={activeConv.friendAvatar} className="w-9 h-9 sm:w-10 sm:h-10" />
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-1.5">
                    {activeConv.friendName}
                    <span className="text-emerald-500 text-[10px] sm:text-xs font-semibold">● Verificado</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    Chat multimedia seguro
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Call Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    startCallWithFriend(
                      activeConv.friendId || activeConv.id,
                      activeConv.friendName,
                      activeConv.friendAvatar,
                      'voice'
                    );
                  }}
                  className="px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95"
                  title={`Llamar por voz a ${activeConv.friendName}`}
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Llamar</span>
                </button>

                {/* Video Call Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    startCallWithFriend(
                      activeConv.friendId || activeConv.id,
                      activeConv.friendName,
                      activeConv.friendAvatar,
                      'video'
                    );
                  }}
                  className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95"
                  title={`Videollamada con ${activeConv.friendName}`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video</span>
                </button>

                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Filtro Activo
                </div>
              </div>
            </div>

            {/* Warning or compression toast */}
            {warningMsg && (
              <div className="m-3 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-2xl flex items-center gap-2 text-xs text-red-700 dark:text-red-200 animate-bounce">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="font-bold">{warningMsg}</span>
              </div>
            )}

            {compressionStatus && (
              <div className="m-3 p-3 bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-600 rounded-2xl flex items-center gap-2 text-xs text-purple-800 dark:text-purple-200 animate-pulse">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold">{compressionStatus}</span>
              </div>
            )}

            {/* Messages feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-900/30">
              {convMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-purple-500" />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-200">
                    ¡Dile hola a {activeConv.friendName}! 👋
                  </h4>
                  <p className="text-xs max-w-xs mt-1">
                    Envíale un mensaje de voz 🎙️, un mini video clip 📹, fotos o stickers divertidos.
                  </p>
                </div>
              ) : (
                convMessages.map((msg) => {
                  const isMine = Boolean(
                    msg.senderId === childProfile.id ||
                    msg.senderName === childProfile.firstName ||
                    (currentUser && msg.senderId === currentUser.uid)
                  );

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <div className="shrink-0 mb-1">
                          <AnimalAvatarIcon animal={msg.senderAvatar || 'fox'} className="w-6 h-6" />
                        </div>
                      )}

                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMine
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-xs border border-slate-100 dark:border-slate-600'
                        }`}
                      >
                        {!isMine && (
                          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-300 mb-0.5">
                            {msg.senderName}
                          </div>
                        )}

                        {/* Audio Voice Message */}
                        {msg.mediaType === 'voice' && msg.mediaUrl && (
                          <AudioMessageBubble
                            audioUrl={msg.mediaUrl}
                            duration={msg.mediaDuration}
                            fileSizeKb={msg.fileSizeKb}
                            isMine={isMine}
                          />
                        )}

                        {/* Video Clip Message */}
                        {msg.mediaType === 'video' && msg.mediaUrl && (
                          <VideoMessageBubble
                            videoUrl={msg.mediaUrl}
                            duration={msg.mediaDuration}
                            fileSizeKb={msg.fileSizeKb}
                            isMine={isMine}
                          />
                        )}

                        {/* Photos or Stickers */}
                        {(msg.mediaType === 'photo' || (!msg.mediaType && msg.mediaUrl)) && (
                          <div className="my-1">
                            <img
                              src={msg.mediaUrl}
                              alt="Foto o Sticker"
                              className="rounded-xl max-h-48 object-contain bg-white/20"
                            />
                            {msg.fileSizeKb && (
                              <div className="text-[9px] font-semibold opacity-80 mt-1 flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 text-amber-300" />
                                Comprimido ({msg.fileSizeKb} KB)
                              </div>
                            )}
                          </div>
                        )}

                        {/* Text Content / Call Event */}
                        {msg.text && (
                          msg.text.startsWith('📞') || msg.text.startsWith('📹') ? (
                            <div className="flex items-center gap-2 py-1 px-2.5 my-0.5 rounded-xl bg-black/15 dark:bg-white/10 font-bold text-xs tracking-wide">
                              <span>{msg.text}</span>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )
                        )}
                      </div>

                      {isMine && (
                        <div className="shrink-0 mb-1">
                          <AnimalAvatarIcon animal={childProfile.avatar} className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticker selector dropdown */}
            {showStickers && (
              <div className="p-3 bg-white dark:bg-slate-750 border-t border-slate-200 dark:border-slate-700 grid grid-cols-6 gap-2">
                {SAFE_STICKERS_GIFS.map((sticker) => (
                  <button
                    key={sticker.id}
                    type="button"
                    onClick={() => handleSend(`[Sticker: ${sticker.title}]`, sticker.url)}
                    className="p-1 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition flex flex-col items-center gap-1 group"
                  >
                    <img
                      src={sticker.url}
                      alt={sticker.title}
                      className="w-10 h-10 object-cover rounded-lg group-hover:scale-105 transition"
                    />
                    <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 truncate w-full text-center">
                      {sticker.emoji} {sticker.title}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Hidden Photo Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Voice Recording Active Bar */}
            {isRecordingVoice ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-800 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-red-600 animate-pulse" />
                      Grabando mensaje de voz: {voiceDuration}s / 60s
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      ⚡ Se comprimirá automáticamente con audio Opus abierto
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStopVoice(false)}
                    className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                    title="Cancelar grabación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStopVoice(true)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Enviar Voz
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Chat input box */
              <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-800/80">
                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={handleStartVoice}
                  className="p-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 transition shadow-xs active:scale-95"
                  title="Grabar mensaje de voz (Opus comprimido)"
                >
                  <Mic className="w-5 h-5" />
                </button>

                {/* Mini Video Recorder Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setIsVideoModalOpen(true);
                  }}
                  className="p-2.5 rounded-2xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition shadow-xs active:scale-95"
                  title="Grabar Mini Video Clip (VP8 comprimido)"
                >
                  <Video className="w-5 h-5" />
                </button>

                {/* Compress Image / Photo Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    fileInputRef.current?.click();
                  }}
                  className="p-2.5 rounded-2xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 transition shadow-xs active:scale-95"
                  title="Enviar foto comprimida con Canvas"
                >
                  <Camera className="w-5 h-5" />
                </button>

                {/* Stickers Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setShowStickers((prev) => !prev);
                  }}
                  className={`p-2.5 rounded-2xl transition shadow-xs active:scale-95 ${
                    showStickers
                      ? 'bg-purple-200 text-purple-700 dark:bg-purple-900/60'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Stickers Divertidos"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  placeholder={`Escribe un mensaje seguro a ${activeConv.friendName}...`}
                  className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-md transition active:scale-95"
                  title="Enviar mensaje"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Mini Video Recorder Modal */}
      <MiniVideoRecorderModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSendVideo={handleSendVideoClip}
      />
    </div>
  );
};
