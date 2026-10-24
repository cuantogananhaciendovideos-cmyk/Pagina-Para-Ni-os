import React, { useState } from 'react';
import { Users, UserPlus, ShieldCheck, Heart, Sparkles, Check, MessageCircle, Phone, Video } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { AnimalAvatar, Friend } from '../types';
import { sounds } from '../services/soundEffects';

export const FriendsView: React.FC = () => {
  const { friends, childProfile, currentUser, myFriendCode, incomingFriendRequests, sendFriendRequestByCode, respondToFriendRequest, startConversationWithFriend, startCallWithFriend, openAuthModal } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AnimalAvatar>('panda');
  const [requestSent, setRequestSent] = useState(false);

  const handleSendRequest = async () => {
    if (!currentUser) {
      setRequestMessage('Inicia sesión o crea tu cuenta para tener un código y enviar solicitudes reales.');
      return;
    }
    if (!friendCodeInput.trim()) {
      setRequestMessage('Escribe el código de amigo que te compartió la otra persona.');
      return;
    }
    setIsSendingRequest(true);
    const result = await sendFriendRequestByCode(friendCodeInput);
    setIsSendingRequest(false);
    setRequestMessage(result.message);
    setRequestSent(result.ok);
    if (result.ok) {
      sounds.playStarCelebration();
      setTimeout(() => {
        setRequestSent(false);
        setShowAddModal(false);
        setFriendCodeInput('');
        setRequestMessage('');
      }, 2400);
    }
  };

  const avatars: AnimalAvatar[] = ['panda', 'rabbit', 'owl', 'lion', 'cat', 'dog', 'koala', 'penguin'];
  // Show a deterministic code immediately, even while the Firestore profile is loading.
  const visibleFriendCode = currentUser
    ? (myFriendCode || `CK-${currentUser.uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-10).padStart(10, '0')}`)
    : '';

  const copyFriendCode = async () => {
    if (!visibleFriendCode) {
      setRequestMessage('Inicia sesión para generar tu código de invitación.');
      return;
    }
    try {
      await navigator.clipboard.writeText(visibleFriendCode);
      setRequestMessage('Código copiado. Ya puedes enviárselo a tu amigo.');
    } catch {
      setRequestMessage(`Tu código es ${visibleFriendCode}. Selecciónalo y cópialo manualmente.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-3xl mx-auto w-full">
      {/* Friends Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-600 text-white shadow-lg relative overflow-hidden border-4 border-white dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Círculo 100% Aprobado por Padres</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Mis Amigos ({friends.length})</h2>
            <p className="text-xs sm:text-sm font-semibold text-white/90">
              Solo tus amigos aprobados por papá y mamá pueden saludarte y ver tus dibujos.
            </p>
          </div>

          <button
            onClick={() => { sounds.playPop(); setShowAddModal(true); }}
            className="px-5 py-3 rounded-2xl bg-white text-purple-700 hover:bg-purple-50 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-purple-600" />
            <span>+ Agregar Amigo</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-testid="friend-invitation-code">
        <div className="min-w-0">
          <p className="text-sm font-black text-indigo-900 dark:text-indigo-200">Tu código para invitar amigos</p>
          <p className="text-xs text-indigo-700 dark:text-indigo-300">Comparte este código para que otra cuenta pueda enviarte una solicitud.</p>
          {currentUser ? (
            <p className="mt-2 inline-block rounded-lg border border-indigo-200 bg-white px-4 py-2 font-mono text-xl font-black tracking-widest text-indigo-800 dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-200" aria-label="Tu código de invitación">{visibleFriendCode}</p>
          ) : (
            <p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-300">Inicia sesión para generar tu código personal.</p>
          )}
        </div>
        <button type="button" onClick={copyFriendCode} disabled={!currentUser} className="shrink-0 rounded-xl bg-indigo-600 px-4 py-3 font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          Copiar código
        </button>
      </div>
      {requestMessage && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{requestMessage}</p>}

      {incomingFriendRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
          <h3 className="font-black text-amber-900 dark:text-amber-200">Solicitudes de amistad recibidas ({incomingFriendRequests.length})</h3>
          {incomingFriendRequests.map((request) => (
            <div key={request.id} className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 p-3">
              <AnimalAvatarIcon animal={request.fromAvatar} className="w-10 h-10" />
              <div className="flex-1 min-w-0"><p className="font-bold text-sm text-slate-800 dark:text-white">{request.fromName}</p><p className="text-xs text-slate-500">Solicitud de cuenta registrada</p></div>
              <button type="button" onClick={async () => { try { await respondToFriendRequest(request.id, true); setRequestMessage('Solicitud aceptada. El chat ya está creado.'); } catch (e) { setRequestMessage(e instanceof Error ? e.message : 'No se pudo aceptar.'); } }} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">Aceptar</button>
              <button type="button" onClick={async () => { try { await respondToFriendRequest(request.id, false); } catch (e) { setRequestMessage(e instanceof Error ? e.message : 'No se pudo rechazar.'); } }} className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold">Rechazar</button>
            </div>
          ))}
        </div>
      )}

      {/* Selected Friend / Imaginary Friend Advice Modal */}
      {selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-purple-400 text-center">
            <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/60 p-2 mx-auto mb-3 border-2 border-purple-300">
              <AnimalAvatarIcon animal={selectedFriend.avatar} className="w-full h-full" />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold mb-1">
              {selectedFriend.isImaginary ? '🦄 Amigo Imaginario de Ejemplo' : 'Amigo Aprobado'}
            </div>

            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {selectedFriend.firstName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedFriend.relation}</p>

            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed mb-4 text-left">
              {selectedFriend.tipMessage || (
                `¡Hola! Soy ${selectedFriend.firstName}. En Clayckey Bookly somos amigos porque nuestros papás revisaron y autorizaron nuestra conexión. ¡Aquí no hay extraños ni mensajes escondidos!`
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  startConversationWithFriend(selectedFriend);
                  setSelectedFriend(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chatear Seguro 💬</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    startCallWithFriend(selectedFriend.id, selectedFriend.firstName, selectedFriend.avatar, 'voice');
                    setSelectedFriend(null);
                  }}
                  className="flex-1 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>Llamar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    startCallWithFriend(selectedFriend.id, selectedFriend.firstName, selectedFriend.avatar, 'video');
                    setSelectedFriend(null);
                  }}
                  className="flex-1 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Videollamada</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedFriend(null)}
                className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friends Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => {
              sounds.playPop();
              setSelectedFriend(friend);
            }}
            className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-4 border shadow-xs flex flex-col items-center text-center hover:scale-105 transition-all cursor-pointer group relative ${
              friend.isImaginary
                ? 'border-pink-300 dark:border-pink-700 ring-2 ring-pink-400/50 bg-gradient-to-b from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20'
                : 'border-slate-200/80 dark:border-slate-700/80'
            }`}
          >
            {friend.isImaginary && (
              <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs animate-bounce">
                ✨ Imaginario
              </span>
            )}

            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-700/60 p-2 mb-2.5 border-2 border-slate-200 dark:border-slate-600 shadow-inner group-hover:rotate-3 transition-transform">
              <AnimalAvatarIcon animal={friend.avatar} className="w-full h-full" />
            </div>

            <h4 className="text-base font-black text-slate-800 dark:text-white">
              {friend.firstName}
            </h4>

            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
              {friend.relation}
            </span>

            <div className="mt-2.5 w-full flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startConversationWithFriend(friend);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1 transition"
                  title="Chatear"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop();
                    startCallWithFriend(friend.id, friend.firstName, friend.avatar, 'voice');
                  }}
                  className="p-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 transition"
                  title={`Llamar a ${friend.firstName}`}
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPop();
                    startCallWithFriend(friend.id, friend.firstName, friend.avatar, 'video');
                  }}
                  className="p-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 transition"
                  title={`Videollamada con ${friend.firstName}`}
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-0.5 rounded-lg">
                <ShieldCheck className="w-3 h-3" />
                <span>{friend.isImaginary ? 'Ejemplo Seguro' : 'Aprobado'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Friend Modal with Parental Code Requirement */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto mb-2 text-purple-600 dark:text-purple-300">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Agregar Nuevo Amigo Seguro
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Usa el código de una cuenta real de Clayckey Bookly. La otra persona debe registrarse e iniciar sesión para recibir tu solicitud.
              </p>
            </div>

            {requestSent ? (
              <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                  ¡Solicitud enviada!
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Tu amigo debe aceptarla para abrir el chat.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Código de amigo:</label>
                  <input type="text" value={friendCodeInput} onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())} placeholder="Ej. CK-A1B2C3D4E5" className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono uppercase text-slate-800 dark:text-white focus:outline-hidden focus:border-purple-500" />
                  {requestMessage && !requestSent && <p className="text-xs mt-2 text-rose-600 dark:text-rose-300">{requestMessage}</p>}
                  {!currentUser && <button type="button" onClick={() => openAuthModal('login')} className="mt-2 text-xs font-bold text-purple-600 underline">Iniciar sesión o crear cuenta</button>}
                </div>

                {requestMessage && requestSent && <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{requestMessage}</p>}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={isSendingRequest || !friendCodeInput.trim()}
                    className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isSendingRequest ? 'Enviando…' : 'Enviar solicitud'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
