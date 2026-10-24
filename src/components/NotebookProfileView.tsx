import React, { useState } from 'react';
import {
  Star,
  Award,
  BookOpen,
  Plus,
  Sparkles,
  Heart,
  UserPlus,
  Check,
  X,
  Camera,
  Video,
  PenLine,
  Image as ImageIcon,
  Palette,
  ShieldCheck,
  MessageCircle,
  Share2,
  Calendar,
  Grid,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { THEME_CONFIGS } from '../services/themes';
import { AnimalAvatar, NotebookTheme, Post } from '../types';
import { SAFE_STICKERS_GIFS } from '../services/mockData';
import { sounds } from '../services/soundEffects';

export const NotebookProfileView: React.FC = () => {
  const {
    childProfile,
    posts,
    comments,
    friends,
    toggleLikePost,
    submitComment,
    openCreatePostModal,
    createChildProfile,
    updateChildTheme,
    updateChildAvatar,
    setActiveTab,
  } = useApp();

  // Internal Profile Navigation Tabs (just like Facebook profile tabs!)
  const [profileTab, setProfileTab] = useState<'posts' | 'photos' | 'videos' | 'gifs' | 'drawings' | 'about'>('posts');
  const [showCoverColorPicker, setShowCoverColorPicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);

  // New Child Profile Form state
  const [newKidName, setNewKidName] = useState('');
  const [newKidAvatar, setNewKidAvatar] = useState<AnimalAvatar>('lion');
  const [newKidTheme, setNewKidTheme] = useState<NotebookTheme>('sky-blue');
  const [newKidGrade, setNewKidGrade] = useState('Kinder / Preescolar');

  // Comment state within profile
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const currentFirstName = childProfile?.firstName || 'Luna';
  const currentTheme = THEME_CONFIGS[childProfile?.theme || 'pink-purple'] || THEME_CONFIGS['pink-purple'];

  // Luna's personal posts with safe checks
  const myPosts = (posts || []).filter(
    (p) =>
      p &&
      p.authorName &&
      (p.authorName === currentFirstName ||
        p.authorName.toLowerCase().includes(currentFirstName.toLowerCase()) ||
        p.authorName.toLowerCase().includes('luna'))
  );

  // Filter media by type for profile tabs with safe optional chaining
  const myPhotos = myPosts.filter((p) => p && p.type === 'photo' && !(p.content || '').includes('Pintorcito'));
  const myVideos = myPosts.filter((p) => p && p.type === 'video');
  const myDrawings = myPosts.filter(
    (p) => p && ((p.content || '').includes('Pintorcito') || (p.content || '').includes('dibuj') || p.type === 'drawing')
  );

  const badges = [
    { id: 1, title: 'Gran Dibujante', icon: '🎨', desc: 'Completó 5 tareas de arte' },
    { id: 2, title: 'Amiga Estrella', icon: '⭐', desc: `${childProfile?.approvedFriendsCount ?? friends.length} amigos aprobados` },
    { id: 3, title: 'Músico de Granja', icon: '🎶', desc: 'Toca melodías en juegos' },
    { id: 4, title: 'Exploradora', icon: '🚀', desc: `${childProfile?.grade || '1° de Primaria'} activa` },
  ];

  const availableAnimals: { id: AnimalAvatar; name: string }[] = [
    { id: 'fox', name: 'Zorrito' },
    { id: 'panda', name: 'Panda' },
    { id: 'rabbit', name: 'Conejito' },
    { id: 'owl', name: 'Búho' },
    { id: 'lion', name: 'Leoncito' },
    { id: 'cat', name: 'Gatito' },
    { id: 'dog', name: 'Perrito' },
    { id: 'koala', name: 'Koala' },
    { id: 'penguin', name: 'Pingüino' },
  ];

  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName.trim()) return;
    createChildProfile(newKidName.trim(), newKidAvatar, newKidTheme, newKidGrade);
    setShowCreateProfileModal(false);
    setNewKidName('');
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    submitComment(postId, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="flex-1 flex flex-col gap-4 sm:gap-6 select-none max-w-4xl mx-auto w-full pb-10">
      {/* Visual Navigation Feedback Bar: Confirms page is open and lets user return with 1 click */}
      <div className="flex items-center justify-between bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <button
          onClick={() => { sounds.playPop(); setActiveTab('feed'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <span>← Volver a Inicio (Muro)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-black text-slate-700 dark:text-slate-200">
            📖 Página Abierta: <span className="text-rose-600 dark:text-rose-400 font-black">Mi Cuaderno Vivo</span>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. FACEBOOK-STYLE PROFILE HEADER & COVER BANNER               */}
      {/* ============================================================ */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-md">
        {/* Customizable Living Notebook Cover Banner */}
        <div
          className={`h-48 sm:h-64 bg-gradient-to-r ${currentTheme.gradient} relative p-4 flex items-end justify-end transition-all duration-300`}
        >
          {/* Subtle star pattern overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none select-none text-white text-7xl font-mono flex items-center justify-around">
            <span>★</span>
            <span>✦</span>
            <span>★</span>
          </div>

          {/* Button to change Cover Theme Color right on the cover */}
          <div className="relative z-10 flex gap-2">
            <button
              onClick={() => {
                sounds.playPop();
                setShowCoverColorPicker(!showCoverColorPicker);
              }}
              className="px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white text-slate-800 font-extrabold text-xs shadow-md backdrop-blur-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Cambiar Color de Portada</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setShowCreateProfileModal(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Crear Otro Cuaderno</span>
            </button>
          </div>

          {/* Color Picker Popover */}
          {showCoverColorPicker && (
            <div className="absolute top-4 right-4 bg-white dark:bg-slate-900 rounded-3xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xl z-20 animate-in fade-in">
              <p className="text-[11px] font-black text-slate-600 dark:text-slate-300 mb-2">
                Elige el color de tu Cuaderno Vivo:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(THEME_CONFIGS).map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => {
                      updateChildTheme(thm.id);
                      setShowCoverColorPicker(false);
                    }}
                    style={{ backgroundColor: thm.pillColor }}
                    className="w-8 h-8 rounded-xl shadow-xs transition-transform hover:scale-110 active:scale-90 flex items-center justify-center cursor-pointer"
                    title={thm.name}
                  >
                    {childProfile.theme === thm.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Info Lockup (Overlapping the cover, exactly like Facebook) */}
        <div className="px-6 sm:px-8 pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div
                onClick={() => {
                  sounds.playPop();
                  setShowAvatarPicker(!showAvatarPicker);
                }}
                title="Toca para cambiar de animalito"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-2xl border-4 border-white dark:border-slate-800 shrink-0 cursor-pointer group hover:scale-105 active:scale-95 transition-transform relative"
              >
                <AnimalAvatarIcon
                  animal={childProfile.avatar}
                  hasBow={childProfile.avatar === 'fox'}
                  className="w-full h-full group-hover:rotate-3 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1.5 shadow-md border-2 border-white dark:border-slate-900">
                  <Palette className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Name & Counters */}
              <div className="pt-2 sm:pt-0 sm:mb-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {childProfile.firstName}
                  </h1>
                  <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" title="Perfil Seguro y Verificado">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  {childProfile.grade} • Portada: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{childProfile.themeName}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 font-black text-xs flex items-center gap-1 border border-amber-200/60 dark:border-amber-800/60">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{childProfile.stars} Estrellitas ganadas</span>
                  </span>

                  <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center gap-1 border border-purple-200/60 dark:border-purple-800/60">
                    <Users className="w-3.5 h-3.5" />
                    <span>{friends.length} Amigos Aprobados</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action in Header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={() => openCreatePostModal('photo')}
                className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>+ Agregar a mi Cuaderno</span>
              </button>
            </div>
          </div>

          {/* Avatar Selector Popover */}
          {showAvatarPicker && (
            <div className="mt-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-in fade-in">
              <p className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                Elige tu animalito favorito para tu foto de perfil:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {availableAnimals.map((an) => (
                  <button
                    key={an.id}
                    onClick={() => {
                      updateChildAvatar(an.id);
                      setShowAvatarPicker(false);
                    }}
                    className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      childProfile.avatar === an.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 scale-105'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:scale-105'
                    }`}
                  >
                    <AnimalAvatarIcon animal={an.id} className="w-9 h-9" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{an.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Internal Sub-Navigation Tabs (Publicaciones, Fotos, Videos, GIFs, Dibujos, Logros) */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 border-t border-slate-200/80 dark:border-slate-700/80 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50 py-2">
          <button
            onClick={() => { sounds.playPop(); setProfileTab('posts'); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === 'posts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📝 Publicaciones ({myPosts.length})
          </button>

          <button
            onClick={() => { sounds.playPop(); setProfileTab('photos'); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === 'photos'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📷 Mis Fotos ({myPhotos.length})
          </button>

          <button
            onClick={() => { sounds.playPop(); setProfileTab('videos'); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === 'videos'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            ▶️ Mis Videos ({myVideos.length})
          </button>

          <button
            onClick={() => { sounds.playPop(); setProfileTab('drawings'); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === 'drawings'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🎨 Mis Dibujos ({myDrawings.length})
          </button>

          <button
            onClick={() => { sounds.playPop(); setProfileTab('gifs'); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === 'gifs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            👾 GIFs y Stickers
          </button>

          <button
            onClick={() => { sounds.playPop(); setProfileTab('about'); }}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === 'about'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🏆 Medallas y Logros
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PROFILE LAYOUT: LEFT SIDEBAR WIDGETS + MAIN FEED CONTENT  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Profile Bio, Friends Grid & Recent Photos Widget */}
        <div className="space-y-4">
          {/* Bio / Info Box */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Información del Cuaderno
            </h3>
            <div className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>Cuaderno Vivo de {childProfile.firstName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>Grado escolar: {childProfile.grade}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{childProfile.stars} Estrellitas acumuladas</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Supervisado por cuenta de padre ligada</span>
              </div>
            </div>
          </div>

          {/* Friends Widget (Top 6 friends in 3 columns, like Facebook) */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Amigos de {childProfile.firstName}
                </h3>
                <span className="text-[10px] text-slate-400">{friends.length} amigos aprobados</span>
              </div>
              <button
                onClick={() => setActiveTab('friends')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {friends.slice(0, 6).map((fr) => (
                <div
                  key={fr.id}
                  onClick={() => setActiveTab('friends')}
                  className="flex flex-col items-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:scale-105 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                    <AnimalAvatarIcon animal={fr.avatar} className="w-full h-full" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 truncate w-full text-center">
                    {fr.firstName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Photos Box */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Fotos del Cuaderno
              </h3>
              <button
                onClick={() => setProfileTab('photos')}
                className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {myPosts.filter((p) => p.mediaUrl).slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setProfileTab('photos')}
                  className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer"
                >
                  <img src={p.mediaUrl} alt="Foto" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER / RIGHT COLUMN: Dedicated Creator Bar + Profile Content Tabs */}
        <div className="lg:col-span-2 space-y-5">
          {/* DIRECT 1-CLICK CREATOR BAR ON PROFILE (Like Facebook's "What's on your mind?") */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            {/* Top trigger input */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 p-1 flex items-center justify-center shrink-0">
                <AnimalAvatarIcon animal={childProfile.avatar} hasBow className="w-8 h-8" />
              </div>
              <button
                onClick={() => openCreatePostModal('text')}
                className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
              >
                ¿Qué hiciste hoy de lindo, {childProfile.firstName}? Escribe en tu cuaderno...
              </button>
            </div>

            {/* 4 GIANT 1-CLICK BUTTONS (Foto, Video, GIF, Escribir) directly on profile */}
            <div className="grid grid-cols-4 gap-2 pt-3">
              <button
                onClick={() => openCreatePostModal('photo')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-extrabold text-xs active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">Foto</span>
              </button>

              <button
                onClick={() => openCreatePostModal('video')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 font-extrabold text-xs active:scale-95 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="truncate">Video</span>
              </button>

              <button
                onClick={() => openCreatePostModal('gif')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-extrabold text-xs active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="truncate">GIF</span>
              </button>

              <button
                onClick={() => openCreatePostModal('text')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-extrabold text-xs active:scale-95 transition-all cursor-pointer"
              >
                <PenLine className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Escribir</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PUBLICACIONES DEL CUADERNO */}
          {profileTab === 'posts' && (
            <div className="space-y-4">
              {myPosts.length === 0 ? (
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-base font-black text-slate-800 dark:text-white">
                    ¡Tu cuaderno está listo para tus recuerdos!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Presiona el botón de Foto, Video, GIF o Escribir arriba para poner tu primera publicación.
                  </p>
                  <button
                    onClick={() => openCreatePostModal('photo')}
                    className="px-5 py-2.5 rounded-2xl bg-rose-500 text-white font-black text-xs shadow-md cursor-pointer"
                  >
                    📷 Subir Foto al Cuaderno
                  </button>
                </div>
              ) : (
                myPosts.map((post) => {
                  const postComments = comments.filter((c) => c.postId === post.id);
                  const isCommentOpen = activeCommentPostId === post.id;

                  return (
                    <article
                      key={post.id}
                      className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 p-1 flex items-center justify-center">
                            <AnimalAvatarIcon animal={post.authorAvatar} hasBow className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                              {post.authorName}
                            </h4>
                            <p className="text-[11px] text-slate-400">{post.timestamp}</p>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                          {post.badge || 'Mi Cuaderno'}
                        </span>
                      </div>

                      {/* Content text */}
                      {post.content && (
                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium mb-3">
                          {post.content}
                        </p>
                      )}

                      {/* Content media */}
                      {post.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-700">
                          <img
                            src={post.mediaUrl}
                            alt="Contenido"
                            className="w-full max-h-80 object-cover"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleLikePost(post.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              post.isLiked
                                ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
                                : 'text-slate-500 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                            <span>{post.likes}</span>
                          </button>

                          <button
                            onClick={() => {
                              sounds.playPop();
                              setActiveCommentPostId(isCommentOpen ? null : post.id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 text-slate-400" />
                            <span>Comentarios {post.commentsCount > 0 ? `(${post.commentsCount})` : ''}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => alert('Compartido con tu círculo familiar aprobado ❤️')}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Compartir</span>
                        </button>
                      </div>

                      {/* Comments section */}
                      {isCommentOpen && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 animate-in fade-in space-y-2">
                          {postComments.map((com) => (
                            <div
                              key={com.id}
                              className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900"
                            >
                              <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 p-0.5 border">
                                <AnimalAvatarIcon animal={com.authorAvatar} className="w-full h-full" />
                              </div>
                              <div className="flex-1">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {com.authorName}:{' '}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-300">
                                  {com.text}
                                </span>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                              placeholder="Escribe un comentario lindo..."
                              className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                            />
                            <button
                              onClick={() => handleSendComment(post.id)}
                              className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                            >
                              Enviar
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: FOTOS DE LUNA */}
          {profileTab === 'photos' && (
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Álbum de Fotos de {childProfile.firstName}
                  </h3>
                  <p className="text-xs text-slate-400">Protegidas con 1 solo clic y sin ubicación</p>
                </div>
                <button
                  onClick={() => openCreatePostModal('photo')}
                  className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
                >
                  + Subir Foto
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myPosts.filter((p) => p.mediaUrl).map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group cursor-pointer"
                  >
                    <img src={post.mediaUrl} alt="Foto" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end">
                      <span className="text-[11px] font-bold text-white truncate">{post.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VIDEOS DE LUNA */}
          {profileTab === 'videos' && (
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Videos de {childProfile.firstName}
                  </h3>
                  <p className="text-xs text-slate-400">Clips infantiles seguros y revisados</p>
                </div>
                <button
                  onClick={() => openCreatePostModal('video')}
                  className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs cursor-pointer"
                >
                  + Subir Video
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myVideos.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
                  >
                    {post.mediaUrl && (
                      <div className="h-40 overflow-hidden relative">
                        <img src={post.mediaUrl} alt="Video" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">
                          ▶
                        </span>
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{post.content}</h4>
                      <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIBUJOS DEL PINTORCITO */}
          {profileTab === 'drawings' && (
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Obras de Arte de {childProfile.firstName}
                  </h3>
                  <p className="text-xs text-slate-400">Pintados en el Pintorcito Mágico y guardados con 1 clic</p>
                </div>
                <button
                  onClick={() => setActiveTab('games')}
                  className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                >
                  🖌️ Ir a Pintar Nuevo Dibujo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myDrawings.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-center"
                  >
                    {post.mediaUrl && (
                      <img src={post.mediaUrl} alt="Dibujo" className="w-full h-32 object-contain rounded-xl mb-1.5" />
                    )}
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block truncate">{post.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GIFS Y STICKERS */}
          {profileTab === 'gifs' && (
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  GIFs y Stickers de {childProfile.firstName}
                </h3>
                <button
                  onClick={() => openCreatePostModal('gif')}
                  className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                >
                  + Elegir GIF
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SAFE_STICKERS_GIFS.map((gif) => (
                  <div
                    key={gif.id}
                    onClick={() => {
                      sounds.playStarCelebration();
                      openCreatePostModal('gif');
                    }}
                    className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center hover:scale-105 transition-all cursor-pointer"
                  >
                    <img src={gif.url} alt={gif.title} className="w-full h-24 object-cover rounded-xl mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{gif.emoji} {gif.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LOGROS Y MEDALLAS */}
          {profileTab === 'about' && (
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Medallas y Logros de {childProfile.firstName}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => sounds.playStarCelebration()}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center hover:scale-105 transition-all cursor-pointer"
                  >
                    <div className="text-4xl mb-2">{b.icon}</div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">{b.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW CHILD PROFILE MODAL */}
      {showCreateProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  ✨
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">
                    Crear Nuevo Cuaderno Vivo
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Crea el perfil de un hermanito o nuevo niño administrado por ti
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateProfileModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Solo el primer nombre del niño (Regla #3 de Seguridad):
                </label>
                <input
                  type="text"
                  required
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  placeholder="Ej. Mateo, Emma, Lucas, Valentina..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. Elige su animalito avatar favorito:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {availableAnimals.map((an) => (
                    <button
                      type="button"
                      key={an.id}
                      onClick={() => setNewKidAvatar(an.id)}
                      className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        newKidAvatar === an.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 scale-105'
                          : 'border-slate-200 dark:border-slate-800 hover:scale-105'
                      }`}
                    >
                      <AnimalAvatarIcon animal={an.id} className="w-8 h-8" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{an.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  3. Elige el color de su Cuaderno Vivo:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {Object.values(THEME_CONFIGS).map((thm) => (
                    <button
                      type="button"
                      key={thm.id}
                      onClick={() => setNewKidTheme(thm.id)}
                      style={{ backgroundColor: thm.pillColor }}
                      className={`h-9 rounded-xl shadow-xs transition-transform cursor-pointer flex items-center justify-center ${
                        newKidTheme === thm.id ? 'scale-110 ring-3 ring-indigo-400' : 'hover:scale-105'
                      }`}
                      title={thm.name}
                    >
                      {newKidTheme === thm.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4. Grado escolar:
                </label>
                <select
                  value={newKidGrade}
                  onChange={(e) => setNewKidGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white"
                >
                  <option value="Preescolar / Kinder">Preescolar / Kinder (5 años)</option>
                  <option value="1° de Primaria">1° de Primaria</option>
                  <option value="2° de Primaria">2° de Primaria</option>
                  <option value="3° de Primaria">3° de Primaria</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProfileModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newKidName.trim()}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>¡Crear Cuaderno con 1 Clic!</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
