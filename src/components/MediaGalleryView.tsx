import React, { useState } from 'react';
import { Camera, Video, Sparkles, Upload, Play, Pause, Heart, Star, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAFE_STICKERS_GIFS } from '../services/mockData';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';

interface MediaGalleryViewProps {
  initialFilter?: 'photos' | 'videos' | 'gifs' | 'all';
}

export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({ initialFilter = 'all' }) => {
  const { openCreatePostModal } = useApp();
  const [filter, setFilter] = useState<'photos' | 'videos' | 'gifs' | 'all'>(initialFilter);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const galleryItems = [
    {
      id: 'media-example-photo',
      type: 'photos',
      title: '🌸 Foto de Ejemplo: Toby jugando con mariposas',
      url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      author: 'Luna',
      likes: 34,
      isExample: true,
      tag: 'Foto de Ejemplo • Sin Ubicación',
    },
    {
      id: 'media-example-video',
      type: 'videos',
      title: '🎬 Video de Ejemplo: El Baile de Clayckey Bookly 🎵',
      url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      duration: '0:25',
      author: 'Clayckey Bookly Mascot',
      likes: 52,
      isExample: true,
      tag: 'Video de Ejemplo • Audio Revisado',
    },
    {
      id: 'media-1',
      type: 'photos',
      title: 'Día de Bloques en la Escuela',
      url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=80',
      author: 'Luna',
      likes: 12,
    },
    {
      id: 'media-2',
      type: 'photos',
      title: 'Panda con Acuarelas',
      url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
      author: 'Noa',
      likes: 18,
    },
    {
      id: 'media-3',
      type: 'photos',
      title: 'Parque de los Dinosaurios',
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      author: 'Leo',
      likes: 15,
    },
    {
      id: 'media-5',
      type: 'videos',
      title: 'Mi Mascota Toby Saltando',
      url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      duration: '0:30',
      author: 'Toby',
      likes: 27,
    },
  ];

  const filteredItems = galleryItems.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleOpenVideo = (id: string) => {
    sounds.playPop();
    setPlayingVideoId(id);
    setIsVideoPlaying(true);
    sounds.playStarCelebration();
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full">
      {/* Top Banner with Giant 1-Click Upload Buttons */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            Galería del Cuaderno
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tus fotos, videos y GIFs seguros para ver y compartir con un solo clic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreatePostModal('photo')}
            className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>+ Foto</span>
          </button>
          <button
            onClick={() => openCreatePostModal('video')}
            className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>+ Video</span>
          </button>
          <button
            onClick={() => openCreatePostModal('gif')}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ GIF</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { sounds.playPop(); setFilter('all'); }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          🌟 Todo
        </button>
        <button
          onClick={() => { sounds.playPop(); setFilter('photos'); }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            filter === 'photos'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          📷 Fotos ({galleryItems.filter((i) => i.type === 'photos').length})
        </button>
        <button
          onClick={() => { sounds.playPop(); setFilter('videos'); }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            filter === 'videos'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          ▶️ Videos ({galleryItems.filter((i) => i.type === 'videos').length})
        </button>
        <button
          onClick={() => { sounds.playPop(); setFilter('gifs'); }}
          className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            filter === 'gifs'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          👾 GIFs Divertidos ({SAFE_STICKERS_GIFS.length})
        </button>
      </div>

      {/* If GIFs selected or all, show sticker picker */}
      {(filter === 'gifs' || filter === 'all') && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <h3 className="text-sm font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Colección de GIFs y Stickers Animados</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {SAFE_STICKERS_GIFS.map((gif) => (
              <div
                key={gif.id}
                onClick={() => {
                  sounds.playStarCelebration();
                  openCreatePostModal('gif');
                }}
                className="rounded-2xl p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer text-center group"
              >
                <img
                  src={gif.url}
                  alt={gif.title}
                  className="w-full h-24 object-cover rounded-xl mb-1.5"
                />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
                  <span>{gif.emoji}</span>
                  <span className="truncate">{gif.title}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Grid */}
      {filter !== 'gifs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl overflow-hidden border shadow-xs group transition-all ${
                item.isExample
                  ? 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-400/30'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                {item.tag && (
                  <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-[10px] font-black shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{item.tag}</span>
                  </span>
                )}

                {item.type === 'videos' && (
                  <button
                    onClick={() => handleOpenVideo(item.id)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-sky-500/90 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Play className="w-5 h-5 ml-1 fill-white" />
                  </button>
                )}
                {item.duration && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold">
                    {item.duration}
                  </span>
                )}
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">Por {item.author}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{item.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Video playback simulation modal */}
      {playingVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-5 border border-slate-700 text-center text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-black">Video de Ejemplo: El Baile de Clayckey Bookly 🎵</span>
              </div>
              <button
                onClick={() => setPlayingVideoId(null)}
                className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-xl cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Simulated Animated Video Screen */}
            <div className="rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center relative p-6 border border-slate-800">
              <div className={`transition-transform duration-300 ${isVideoPlaying ? 'animate-bounce' : ''}`}>
                <AnimalAvatarIcon animal="fox" className="w-24 h-24 drop-shadow-lg" />
              </div>

              <div className="flex items-center gap-2 mt-3 text-amber-300 font-bold text-sm">
                <span>🎵 ¡Un pasito a la izquierda, una vuelta al zorrito! 🐾✨</span>
              </div>

              <button
                onClick={() => {
                  sounds.playPop();
                  setIsVideoPlaying(!isVideoPlaying);
                  if (!isVideoPlaying) sounds.playAnimalChime('fox');
                }}
                className="mt-4 px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isVideoPlaying ? 'Pausar Video' : 'Reanudar Video'}</span>
              </button>
            </div>

            {/* Audio transcription safety badge */}
            <div className="mt-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2 text-left">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">Audio Transcrito y Verificado:</span>
                <span>El servidor analizó todo el sonido y letra de la canción. 100% seguro y limpio.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
