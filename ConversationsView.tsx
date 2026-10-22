import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { AnimalAvatar, ChatMessage } from '../types';
import { sounds } from '../services/soundEffects';
import { SAFE_STICKERS_GIFS } from '../services/mockData';

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
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const convMessages = messages.filter((m) => m.conversationId === (activeConv?.id || ''));

  const handleSend = (textToSend?: string, mediaUrl?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() && !mediaUrl) return;

    sounds.playPop();
    const result = sendMessage(activeConv.id, text, mediaUrl);

    if (!result.isSafe) {
      setWarningMsg(result.level === 'red'
        ? '⚠️ El mensaje fue bloqueado por seguridad infantil (Código Rojo).'
        : '🚫 Este mensaje no se puede compartir porque infringe las reglas de la plataforma.');
      setTimeout(() => setWarningMsg(null), 4000);
    } else {
      setInputText('');
      setShowStickers(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden select-none min-h-[620px]">
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
              Supervisada en tiempo real con Código Rojo • Guardada en Firebase
            </p>
          </div>
        </div>

        {!currentUser && (
          <button
            onClick={() => {
              sounds.playPop();
              openAuthModal();
            }}
            className="px-3.5 py-1.5 bg-white text-purple-700 hover:bg-purple-50 rounded-full text-xs font-black shadow transition active:scale-95"
          >
            🔐 Conectar Firebase
          </button>
        )}
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left conversations list */}
        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-850 border-r border-slate-100 dark:border-slate-700/60 p-3 flex flex-col">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-1 uppercase tracking-wider mb-2">
            Amigos Aprobados ({conversations.length})
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
                  }}
                  className={`w-full p-2.5 rounded-2xl text-left flex items-center gap-3 transition ${
                    isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-400 dark:border-purple-500 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-750 border-2 border-transparent'
                  }`}
                >
                  <AnimalAvatarIcon animal={conv.friendAvatar} className="w-11 h-11" />
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
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
            {/* Chat header */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <AnimalAvatarIcon animal={activeConv.friendAvatar} className="w-11 h-11" />
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-1.5">
                    {activeConv.friendName}
                    <span className="text-emerald-500 text-xs font-semibold">● Amigo Verificado</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mensajes privados y supervisados por los padres
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Filtro Activo
              </div>
            </div>

            {/* Warning toast if blocked */}
            {warningMsg && (
              <div className="m-3 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-2xl flex items-center gap-2 text-xs text-red-700 dark:text-red-200 animate-bounce">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="font-bold">{warningMsg}</span>
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
                    Comparte stickers divertidos, emojis o platiquen de las tareas de la escuela.
                  </p>
                </div>
              ) : (
                convMessages.map((msg) => {
                  const isMine =
                    msg.senderId === childProfile.id ||
                    msg.senderName === childProfile.firstName ||
                    (currentUser && msg.senderId === currentUser.uid);

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <div className="shrink-0 mb-1">
                          <AnimalAvatarIcon animal={msg.senderAvatar} className="w-6 h-6" />
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

                        {msg.mediaUrl && (
                          <img
                            src={msg.mediaUrl}
                            alt="Sticker"
                            className="rounded-xl max-h-36 object-contain my-1 bg-white/20"
                          />
                        )}

                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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

            {/* Chat input box */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setShowStickers((prev) => !prev);
                }}
                className={`p-2.5 rounded-2xl transition ${
                  showStickers
                    ? 'bg-purple-200 text-purple-700 dark:bg-purple-900/60'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="Stickers Divertidos"
              >
                <Smile className="w-5 h-5" />
              </button>

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
          </div>
        ) : null}
      </div>
    </div>
  );
};
