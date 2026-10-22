import React from 'react';
import { LifeBuoy, Heart, Check, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/soundEffects';

export const SosHelpModal: React.FC = () => {
  const { isSosModalOpen, setIsSosModalOpen, childProfile } = useApp();

  if (!isSosModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-4 border-rose-400">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/60 rounded-3xl flex items-center justify-center mx-auto mb-4 text-rose-500 animate-bounce">
          <LifeBuoy className="w-12 h-12" />
        </div>

        <h3 className="text-2xl font-black text-slate-800 dark:text-white">
          ¡Tranquila, {childProfile.firstName}!
        </h3>

        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2 mb-6">
          Tus papás recibieron una alerta inmediata en sus teléfonos. Todo está seguro y nadie puede molestarte aquí. ❤️
        </p>

        <div className="bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 mb-5 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center gap-2">
          <PhoneCall className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Alerta de Ayuda enviada a tus padres</span>
        </div>

        <button
          onClick={() => {
            sounds.playPop();
            setIsSosModalOpen(false);
          }}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>¡Todo está bien ahora!</span>
        </button>
      </div>
    </div>
  );
};
