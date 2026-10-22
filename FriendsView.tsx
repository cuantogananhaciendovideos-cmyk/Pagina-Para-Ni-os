import React, { useState } from 'react';
import { Users, UserPlus, ShieldCheck, Heart, Sparkles, Check, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { AnimalAvatar, Friend } from '../types';
import { sounds } from '../services/soundEffects';

export const FriendsView: React.FC = () => {
  const { friends, addFriendRequest, childProfile, startConversationWithFriend } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AnimalAvatar>('panda');
  const [requestSent, setRequestSent] = useState(false);

  const handleSendRequest = () => {
    if (!friendNameInput.trim()) return;
    sounds.playStarCelebration();
    addFriendRequest(friendNameInput.trim(), selectedAvatar);
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setShowAddModal(false);
      setFriendNameInput('');
      setFriendCodeInput('');
    }, 1500);
  };

  const avatars: AnimalAvatar[] = ['panda', 'rabbit', 'owl', 'lion', 'cat', 'dog', 'koala', 'penguin'];

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
                `¡Hola! Soy ${selectedFriend.firstName}. En ClukyBook somos amigos porque nuestros papás revisaron y autorizaron nuestra conexión. ¡Aquí no hay extraños ni mensajes escondidos!`
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  startConversationWithFriend(selectedFriend);
                  setSelectedFriend(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chatear Seguro 💬</span>
              </button>
              <button
                onClick={() => setSelectedFriend(null)}
                className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startConversationWithFriend(friend);
                }}
                className="w-full py-1.5 px-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chatear 💬</span>
              </button>
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
                Para tu seguridad, esta solicitud llegará directo a tus papás para que la aprueben con un solo clic.
              </p>
            </div>

            {requestSent ? (
              <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                  ¡Solicitud enviada a tus papás!
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  En cuanto la acepten, aparecerá en tus amigos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Primer nombre de tu amigo/a:
                  </label>
                  <input
                    type="text"
                    value={friendNameInput}
                    onChange={(e) => setFriendNameInput(e.target.value)}
                    placeholder="Ej. Mateo, Sofía, Lucas..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Código de Amigo o Clase (opcional):
                  </label>
                  <input
                    type="text"
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value)}
                    placeholder="Ej. CLUKY-AMIGO-492"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white focus:outline-hidden focus:border-purple-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    Elige su animalito favorito:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {avatars.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          selectedAvatar === av
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 scale-105'
                            : 'border-slate-200 dark:border-slate-700 hover:scale-105'
                        }`}
                      >
                        <AnimalAvatarIcon animal={av} className="w-8 h-8" />
                      </button>
                    ))}
                  </div>
                </div>

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
                    disabled={!friendNameInput.trim()}
                    className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Pedir a Papá Aprobación
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
