import React, { useState } from 'react';
import {
  Camera,
  Video,
  Sparkles,
  PenLine,
  Heart,
  MessageCircle,
  Share2,
  GraduationCap,
  CheckCircle,
  Send,
  Star,
  Shield,
  Smile,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';

export const FeedView: React.FC = () => {
  const {
    posts,
    comments,
    tasks,
    childProfile,
    toggleLikePost,
    submitComment,
    submitTask,
    openCreatePostModal,
    setActiveTab,
  } = useApp();

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  // Homework card
  const pendingTask = tasks.find((t) => !t.isCompleted) || tasks[0];

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    const result = submitComment(postId, commentInput.trim());
    if (result.isSafe) {
      setCommentInput('');
      setCommentFeedback('¡Comentario publicado con éxito! 🎉');
      setTimeout(() => setCommentFeedback(null), 3000);
    } else {
      setCommentFeedback(`⚠️ Interceptado por Código Rojo: ${result.explanation}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-5 select-none max-w-2xl mx-auto w-full">
      {/* Facebook-style Kid Profile Quick Banner: 1-Click to open Mi Cuaderno */}
      <div
        onClick={() => { sounds.playPop(); setActiveTab('notebook'); }}
        title="Toca para abrir tu perfil de Mi Cuaderno Vivo"
        className="flex items-center justify-between p-3 sm:p-4 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-md cursor-pointer group hover:shadow-lg transition-all active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 p-1 flex items-center justify-center shrink-0 border border-white/30 group-hover:scale-105 transition-transform">
            <AnimalAvatarIcon animal={childProfile?.avatar || 'fox'} hasBow className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black flex items-center gap-1.5 leading-tight">
              <span>¡Hola, {childProfile?.firstName || 'Luna'}!</span>
              <span className="text-xs font-bold bg-white/25 px-2 py-0.5 rounded-full">Mi Cuaderno Vivo</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-rose-100 font-medium">
              Toca aquí para ver tu perfil, fotos, tareas y personalizar tu portada
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-rose-600 font-black text-xs shadow-xs group-hover:bg-rose-50 transition-colors shrink-0">
          <span>Abrir Cuaderno ➔</span>
        </div>
      </div>

      {/* 4 GIANT QUICK ACTION BUTTONS - Strictly matching user mockup */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        {/* FOTO (Pink) */}
        <button
          onClick={() => openCreatePostModal('photo')}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/80 transition-all active:scale-95 cursor-pointer group shadow-2xs"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-400/30 group-hover:scale-105 transition-transform mb-2">
            <Camera className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-300">
            Foto
          </span>
        </button>

        {/* VIDEO (Blue) */}
        <button
          onClick={() => openCreatePostModal('video')}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 border border-sky-200/80 dark:border-sky-900/80 transition-all active:scale-95 cursor-pointer group shadow-2xs"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-400/30 group-hover:scale-105 transition-transform mb-2">
            <Video className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-sky-700 dark:text-sky-300">
            Video
          </span>
        </button>

        {/* GIF (Purple) */}
        <button
          onClick={() => openCreatePostModal('gif')}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-900/80 transition-all active:scale-95 cursor-pointer group shadow-2xs"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-400/30 group-hover:scale-105 transition-transform mb-2">
            <span className="text-base sm:text-lg font-black tracking-tighter flex items-center gap-0.5">
              GIF <Sparkles className="w-3.5 h-3.5 text-amber-300 inline" />
            </span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-purple-700 dark:text-purple-300">
            GIF
          </span>
        </button>

        {/* ESCRIBIR (Green) */}
        <button
          onClick={() => openCreatePostModal('text')}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-900/80 transition-all active:scale-95 cursor-pointer group shadow-2xs"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-400/30 group-hover:scale-105 transition-transform mb-2">
            <PenLine className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
            Escribir
          </span>
        </button>
      </div>

      {/* SECTION HEADER: "Muro" strictly matching mockup */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Muro
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold">
          <Shield className="w-3 h-3 text-emerald-500" />
          Sin algoritmos adictivos • Orden de tiempo
        </span>
      </div>

      {/* FEED POST 1: Exactly as in user mockup (Kids playing with colorful blocks) */}
      {posts.filter((p) => p.isApprovedByParent !== false).map((post, index) => {
        const postComments = comments.filter((c) => c.postId === post.id);
        const isCommentOpen = activeCommentPostId === post.id;

        return (
          <React.Fragment key={post.id}>
            <article className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs kid-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-3.5">
                <div
                  onClick={() => {
                    sounds.playPop();
                    if (post.authorName.includes(childProfile.firstName)) {
                      setActiveTab('notebook');
                    } else if (post.authorRole === 'teacher') {
                      setActiveTab('classroom');
                    } else {
                      setActiveTab('friends');
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                  title="Toca para ver su perfil o clase"
                >
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 p-1 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 group-hover:scale-105 transition-transform">
                    <AnimalAvatarIcon animal={post.authorAvatar} className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {post.authorName}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {post.timestamp}
                    </p>
                  </div>
                </div>

                {/* Badge e.g. "Mi Clase" */}
                {post.badge && (
                  <button
                    onClick={() => {
                      sounds.playPop();
                      if (post.badge?.includes('Clase')) {
                        setActiveTab('classroom');
                      } else {
                        setActiveTab('notebook');
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{post.badge}</span>
                  </button>
                )}
              </div>

              {/* Text content if present */}
              {post.content && (
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium mb-3 leading-relaxed">
                  {post.content}
                </p>
              )}

              {/* Media image if present (as in mockup) */}
              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden mb-3.5 border border-slate-100 dark:border-slate-700/60 shadow-inner max-h-80 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={post.mediaUrl}
                    alt="Contenido seguro de ClukyBook"
                    className="w-full h-full object-cover max-h-72 hover:scale-[1.01] transition-transform"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Reactions Bar - Exactly matching mockup: Heart count, Comentar count, Compartir */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      post.isLiked
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
                        : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`}
                    />
                    <span>{post.likes}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setActiveCommentPostId(isCommentOpen ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-500" />
                    <span>Comentar {post.commentsCount > 0 ? post.commentsCount : ''}</span>
                  </button>
                </div>

                {/* Compartir Button (círculo cerrado de amigos y familia) */}
                <button
                  onClick={() => {
                    sounds.playPop();
                    alert('Compartido en el álbum seguro de tu familia 💖');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  title="Compartir con tu familia aprobada"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>

              {/* Comments Section */}
              {isCommentOpen && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 animate-in fade-in">
                  {/* List of comments */}
                  <div className="space-y-2 mb-3">
                    {postComments.map((com) => (
                      <div
                        key={com.id}
                        className="flex items-start gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                          <AnimalAvatarIcon animal={com.authorAvatar} className="w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {com.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400">{com.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {com.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input with 1-click friendly emoji picker */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                      placeholder="Escribe algo lindo y seguro..."
                      className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-indigo-400 text-slate-800 dark:text-white"
                    />
                    <button
                      onClick={() => handleSendComment(post.id)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {commentFeedback && (
                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                      {commentFeedback}
                    </p>
                  )}
                </div>
              )}
            </article>

            {/* Insert Homework Card right after the first post — EXACTLY AS IN USER MOCKUP */}
            {index === 0 && pendingTask && (
              <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-100 dark:from-purple-950/60 dark:via-indigo-950/60 dark:to-purple-950/60 rounded-3xl p-5 border border-purple-200/80 dark:border-purple-800 shadow-xs text-center relative overflow-hidden">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2">
                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Mi Clase — Tarea de la maestra</span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-1.5">
                  {pendingTask.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
                  {pendingTask.description}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => { sounds.playPop(); setActiveTab('classroom'); }}
                    className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-purple-400/40 active:scale-95 transition-all cursor-pointer"
                  >
                    Ver detalles
                  </button>

                  <button
                    onClick={() => submitTask(pendingTask.id)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-emerald-400/40 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>¡Entregar mi Tarea con 1 Clic!</span>
                  </button>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
