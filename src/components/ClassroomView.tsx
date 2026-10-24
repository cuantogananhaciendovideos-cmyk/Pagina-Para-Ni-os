import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Star,
  Upload,
  Sparkles,
  BookOpen,
  MessageSquare,
  Shield,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';

export const ClassroomView: React.FC = () => {
  const { tasks, childProfile, submitTask, friends } = useApp();
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState<string | null>(null);

  const classmates = friends.filter((f) => f.relation === 'Compañero de Clase');

  const handleDeliver = (taskId: string) => {
    sounds.playStarCelebration();
    submitTask(
      taskId,
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
    );
    setSelectedTaskForUpload(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-3xl mx-auto w-full">
      {/* Classroom Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white shadow-lg relative overflow-hidden border-4 border-white dark:border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-md shrink-0 flex items-center justify-center">
              <AnimalAvatarIcon animal="owl" className="w-full h-full" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Página de Clase Cerrada</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">1° Primaria — Los Exploradores</h2>
              <p className="text-xs sm:text-sm font-semibold text-white/90">
                Maestra: Maestra Elena (Verificada 🎓) • Código: <span className="font-mono bg-white/30 px-2 py-0.5 rounded-md">CLUKY-1A-782</span>
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-xs px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] font-bold block uppercase tracking-wider text-emerald-100">
              Seguridad de Clase
            </span>
            <span className="text-xs font-black flex items-center gap-1 justify-center text-white">
              <Shield className="w-3.5 h-3.5 text-emerald-200" /> Cero Chat Privado
            </span>
          </div>
        </div>
      </div>

      {/* Homework / Tareas Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-500" />
            <span>Tareas y Actividades de la Clase</span>
          </h3>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
            {tasks.filter((t) => t.isCompleted).length} de {tasks.length} entregadas
          </span>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                task.isCompleted
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {task.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ¡Entregada!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> Pendiente
                      </span>
                    )}

                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                      +{task.rewardStars} estrellitas
                    </span>

                    {task.teacherName.includes('Imaginario') && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                        🦉 Maestro Imaginario de Ejemplo
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {task.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {task.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                    Fecha límite: {task.dueDate} • Publicado por {task.teacherName}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {task.isCompleted ? (
                    <div className="text-center px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                      ⭐ +{task.rewardStars} Estrellitas Ganadas
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeliver(task.id)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-emerald-400/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>¡Entregar con 1 Clic!</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Show submission image if completed */}
              {task.submissionMediaUrl && (
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
                  <img
                    src={task.submissionMediaUrl}
                    alt="Trabajo entregado"
                    className="w-12 h-12 object-cover rounded-xl border border-emerald-300"
                  />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      Trabajo entregado por {childProfile.firstName}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      {task.submissionDate} • Revisado y aprobado por la maestra Elena
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Classmates Gallery */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Compañeros de Clase ({classmates.length})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {classmates.map((kid) => (
            <div
              key={kid.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 p-1 mb-2 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <AnimalAvatarIcon animal={kid.avatar} className="w-full h-full" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {kid.firstName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                1° Primaria
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
