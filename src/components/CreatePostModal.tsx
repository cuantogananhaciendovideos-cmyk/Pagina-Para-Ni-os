import React, { useState } from 'react';
import {
  Camera,
  Video,
  Sparkles,
  PenLine,
  X,
  Upload,
  Check,
  Smile,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAFE_STICKERS_GIFS } from '../services/mockData';
import { sounds } from '../services/soundEffects';

export const CreatePostModal: React.FC = () => {
  const { createPostType, closeCreatePostModal, publishPost, childProfile } = useApp();

  const [textInput, setTextInput] = useState('');
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');
  const [filterWarning, setFilterWarning] = useState<string | null>(null);

  if (!createPostType) return null;

  const samplePhotos = [
    { id: 'p1', title: 'Dibujo de Acuarela', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80' },
    { id: 'p2', title: 'Bloques de Construcción', url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=80' },
    { id: 'p3', title: 'Dinosaurio Pintado', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80' },
  ];

  const sampleVideos = [
    { id: 'v1', title: 'Baile Infantil', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
    { id: 'v2', title: 'Perrito Jugando', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80' },
  ];

  const emojis = ['😊', '⭐', '🎨', '🚀', '🐱', '🐶', '🌈', '🎉', '💖', '📚'];

  const handleSubmit = () => {
    let finalContent = textInput.trim();
    if (!finalContent && createPostType === 'photo') finalContent = '¡Miren esta foto bonita en mi cuaderno! 📷';
    if (!finalContent && createPostType === 'video') finalContent = '¡Miren este video divertido! 🎬';
    if (!finalContent && createPostType === 'gif') finalContent = '¡Sticker animado favorito! ✨';

    const mediaUrl = selectedMediaUrl || (
      createPostType === 'photo' ? samplePhotos[0].url :
      createPostType === 'video' ? sampleVideos[0].url :
      createPostType === 'gif' ? SAFE_STICKERS_GIFS[0].url : undefined
    );

    const safety = publishPost({
      type: createPostType,
      content: finalContent,
      mediaUrl,
    });

    if (!safety.isSafe) {
      setFilterWarning(safety.explanation);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {createPostType === 'photo' && (
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
            )}
            {createPostType === 'video' && (
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
            )}
            {createPostType === 'gif' && (
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            {createPostType === 'text' && (
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                <PenLine className="w-5 h-5" />
              </div>
            )}

            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white capitalize">
                {createPostType === 'photo' && 'Subir Foto con 1 Clic'}
                {createPostType === 'video' && 'Subir Video Seguro con 1 Clic'}
                {createPostType === 'gif' && 'Elegir Sticker GIF Divertido'}
                {createPostType === 'text' && 'Escribir en mi Cuaderno'}
              </h3>
              <p className="text-[11px] text-slate-400">Protegido por Código Rojo</p>
            </div>
          </div>

          <button
            onClick={closeCreatePostModal}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on type */}
        <div className="py-4 space-y-4">
          {createPostType === 'photo' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Elige una foto para tu cuaderno:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {samplePhotos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { sounds.playPop(); setSelectedMediaUrl(p.url); }}
                    className={`rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedMediaUrl === p.url ? 'border-rose-500 scale-105' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.title} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>

              {/* Direct upload */}
              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 cursor-pointer text-xs font-bold text-rose-700 dark:text-rose-300">
                <Upload className="w-4 h-4" />
                <span>O sube una foto desde tu dispositivo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {createPostType === 'gif' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Toca tu GIF favorito con un solo clic:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SAFE_STICKERS_GIFS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => { sounds.playPop(); setSelectedMediaUrl(g.url); }}
                    className={`p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedMediaUrl === g.url ? 'border-purple-600 scale-105 bg-purple-50 dark:bg-purple-950/50' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={g.url} alt={g.title} className="w-full h-16 object-cover rounded-lg" />
                    <span className="text-[10px] font-bold block mt-1 text-center truncate">{g.emoji} {g.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {createPostType === 'video' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Elige un video seguro de la galería:
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {sampleVideos.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => { sounds.playPop(); setSelectedMediaUrl(v.url); }}
                    className={`rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedMediaUrl === v.url ? 'border-sky-500 scale-105' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={v.url} alt={v.title} className="w-full h-24 object-cover" />
                    <span className="text-[10px] font-bold p-1 block truncate text-center">{v.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Input / Note */}
          <div>
            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); setFilterWarning(null); }}
              placeholder={createPostType === 'text' ? '¿Qué hiciste hoy de lindo?' : 'Escribe algo bonito para acompañar (opcional)...'}
              className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          {/* Emoji tap bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-bold mr-1">Toca:</span>
            {emojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => { sounds.playPop(); setTextInput((t) => t + ' ' + em); }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-base flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-90"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Real-time Warning if Código Rojo triggers */}
          {filterWarning && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{filterWarning}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={closeCreatePostModal}
            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>¡Publicar en mi Cuaderno!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
