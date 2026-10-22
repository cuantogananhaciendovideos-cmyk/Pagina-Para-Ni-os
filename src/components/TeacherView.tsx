import React, { useState } from 'react';
import {
  GraduationCap,
  PlusCircle,
  Star,
  CheckCircle,
  Send,
  Users,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';

export const TeacherView: React.FC = () => {
  const { tasks, friends, childProfile, publishPost } = useApp();

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [rewardStars, setRewardStars] = useState(10);
  const [announcementText, setAnnouncementText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handlePostAnnouncement = () => {
    if (!announcementText.trim()) return;
    publishPost({
      type: 'text',
      content: `Aviso de la Maestra Elena: ${announcementText.trim()}`,
    });
    setAnnouncementText('');
    setFeedbackMsg('¡Aviso publicado en el muro de toda la clase y visible para los padres! 🎓');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleAwardStarToStudent = (studentName: string) => {
    sounds.playStarCelebration();
    confetti({ particleCount: 50, spread: 60 });
    setFeedbackMsg(`¡Le diste una estrellita de felicitación a ${studentName}! ⭐`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-3xl mx-auto w-full">
      {/* Teacher Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg relative overflow-hidden border-4 border-white dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-md shrink-0 flex items-center justify-center">
            <AnimalAvatarIcon animal="owl" className="w-full h-full" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Modo Maestro Verificado</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Panel de la Maestra Elena</h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-semibold">
              1° de Primaria • Código de invitación: <span className="font-mono bg-white/20 px-2 py-0.5 rounded-md">CLUKY-1A-782</span>
            </p>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 animate-in fade-in">
          {feedbackMsg}
        </div>
      )}

      {/* Post announcement */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Publicar Aviso para la Clase y Padres
        </h3>
        <textarea
          rows={3}
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
          placeholder="Escribe un aviso para los alumnos y sus familias..."
          className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 mb-3"
        />
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
            <Shield className="w-3 h-3 text-emerald-500" /> Visible en el muro de alumnos y padres
          </span>
          <button
            onClick={handlePostAnnouncement}
            disabled={!announcementText.trim()}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publicar Aviso</span>
          </button>
        </div>
      </div>

      {/* Award Stars to Students */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Premiar con Estrellitas a tus Alumnos</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {friends.slice(0, 4).map((kid) => (
            <div
              key={kid.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-1 mb-2 border">
                <AnimalAvatarIcon animal={kid.avatar} className="w-full h-full" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white mb-2">
                {kid.firstName}
              </span>
              <button
                onClick={() => handleAwardStarToStudent(kid.firstName)}
                className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[11px] shadow-xs cursor-pointer flex items-center justify-center gap-1 active:scale-90 transition-transform"
              >
                <Star className="w-3 h-3 fill-slate-900" />
                <span>+1 Estrella</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
