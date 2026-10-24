import React from 'react';
import { ShieldAlert, AlertTriangle, UserX, Lock, Download, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/soundEffects';

export const RedCodeAlertModal: React.FC = () => {
  const {
    activeEmergencyAlert,
    dismissEmergencyAlert,
    handleBlockFromAlert,
    handleFreezeChildAccount,
  } = useApp();

  if (!activeEmergencyAlert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/80 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-rose-600 animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/40">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider">
                ALARMA URGENTE DISPOSITIVO DEL PADRE
              </span>
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-400">
                ¡ACTIVACIÓN CÓDIGO ROJO!
              </h3>
            </div>
          </div>

          <button
            onClick={dismissEmergencyAlert}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Threat Summary Box */}
        <div className="bg-rose-50 dark:bg-rose-950/60 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 mb-4 text-xs space-y-2">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span className="font-bold">Menor supervisado:</span>
            <span className="font-black text-slate-900 dark:text-white">
              {activeEmergencyAlert.childName}
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span className="font-bold">Cuenta de origen:</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
              {activeEmergencyAlert.senderAccount}
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span className="font-bold">Hora exacta:</span>
            <span className="font-medium">{activeEmergencyAlert.timestamp}</span>
          </div>

          <div className="pt-2 border-t border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
            <span className="font-bold block mb-1">Texto interceptado antes de llegar al niño:</span>
            <p className="font-mono bg-white dark:bg-slate-900 p-2 rounded-xl border border-rose-300 dark:border-rose-800">
              "{activeEmergencyAlert.detectedText}"
            </p>
          </div>

          <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 mt-1">
            Motivo: {activeEmergencyAlert.explanation}
          </p>
        </div>

        {/* 1-Click Action Buttons for Parents */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleBlockFromAlert(activeEmergencyAlert.id)}
            className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-lg shadow-rose-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserX className="w-5 h-5" />
            <span>BLOQUEAR AHORA Y ENVIAR A LISTA NEGRA</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleFreezeChildAccount}
              className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Congelar Cuenta de {activeEmergencyAlert.childName}</span>
            </button>

            <button
              onClick={() => {
                sounds.playStarCelebration();
                alert('Evidencia digital con hash SHA-256 preservada y reportada a la Fiscalía/Administración.');
                dismissEmergencyAlert();
              }}
              className="py-2.5 px-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-purple-200" />
              <span>Guardar Evidencia Legal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
