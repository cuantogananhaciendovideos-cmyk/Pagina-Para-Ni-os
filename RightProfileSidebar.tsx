import React, { useState } from 'react';
import { Palette, Star, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { THEME_CONFIGS } from '../services/themes';
import { AnimalAvatar, NotebookTheme } from '../types';
import { sounds } from '../services/soundEffects';

export const RightProfileSidebar: React.FC = () => {
  const {
    childProfile,
    friends,
    setActiveTab,
    updateChildTheme,
    updateChildAvatar,
  } = useApp();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const currentTheme = THEME_CONFIGS[childProfile.theme] || THEME_CONFIGS['pink-purple'];
  const topFriends = friends.slice(0, 3);

  const availableAnimals: { id: AnimalAvatar; name: string }[] = [
    { id: 'fox', name: 'Zorrito' },
    { id: 'panda', name: 'Panda' },
    { id: 'rabbit', name: 'Conejo' },
    { id: 'owl', name: 'Búho' },
    { id: 'lion', name: 'León' },
    { id: 'cat', name: 'Gatito' },
    { id: 'dog', name: 'Perrito' },
    { id: 'koala', name: 'Koala' },
    { id: 'penguin', name: 'Pingüino' },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 select-none flex flex-col gap-4">
      {/* Kid Profile Card - Exactly as in user mockup */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs text-center relative overflow-hidden">
        {/* Soft top gradient banner */}
        <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-r ${currentTheme.bannerGradient}`} />

        <div className="relative pt-3 flex flex-col items-center">
          {/* Avatar with click to change */}
          <div
            onClick={() => { sounds.playPop(); setShowAvatarPicker(!showAvatarPicker); }}
            title="Toca para cambiar tu animalito favorito"
            className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-lg cursor-pointer border-3 border-white dark:border-slate-800 transition-transform hover:scale-105 active:scale-95 group relative"
          >
            <AnimalAvatarIcon
              animal={childProfile.avatar}
              hasBow={childProfile.avatar === 'fox'}
              className="w-full h-full drop-shadow-sm group-hover:rotate-3 transition-transform"
            />
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-xs border border-slate-200 dark:border-slate-700">
              <span className="text-[10px]">✨</span>
            </div>
          </div>

          {/* First name only - Click to open Mi Cuaderno profile */}
          <h3
            onClick={() => { sounds.playPop(); setActiveTab('notebook'); }}
            className="text-2xl font-black text-slate-800 dark:text-white mt-3 tracking-tight cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Toca para abrir el perfil de Mi Cuaderno"
          >
            {childProfile.firstName}
          </h3>

          <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{childProfile.stars} Estrellitas ganadas</span>
          </div>

          {/* Direct Big Button to open Mi Cuaderno */}
          <button
            onClick={() => { sounds.playPop(); setActiveTab('notebook'); }}
            className="mt-3 w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Abrir Mi Cuaderno →</span>
          </button>

          {/* Theme customizer pill - As shown in mockup: "Portada: Rosa & Violeta" */}
          <button
            onClick={() => { sounds.playPop(); setShowColorPicker(!showColorPicker); }}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            <Palette className="w-4 h-4 text-purple-500" />
            <span className="truncate">Portada: {childProfile.themeName}</span>
          </button>

          {/* Color palette popover for 1-click kid customization */}
          {showColorPicker && (
            <div className="mt-3 w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 animate-in fade-in">
              <p className="text-[11px] font-bold text-slate-500 mb-2">¡Elige tu color favorito!</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(THEME_CONFIGS).map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => {
                      updateChildTheme(thm.id);
                      setShowColorPicker(false);
                    }}
                    style={{ backgroundColor: thm.pillColor }}
                    className="w-8 h-8 rounded-xl shadow-xs transition-transform hover:scale-110 active:scale-90 flex items-center justify-center cursor-pointer mx-auto"
                    title={thm.name}
                  >
                    {childProfile.theme === thm.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Animal avatar selector popover */}
          {showAvatarPicker && (
            <div className="mt-3 w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 animate-in fade-in">
              <p className="text-[11px] font-bold text-slate-500 mb-2">Elige tu animalito</p>
              <div className="grid grid-cols-3 gap-2">
                {availableAnimals.map((an) => (
                  <button
                    key={an.id}
                    onClick={() => {
                      updateChildAvatar(an.id);
                      setShowAvatarPicker(false);
                    }}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      childProfile.avatar === an.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 scale-105'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105'
                    }`}
                  >
                    <AnimalAvatarIcon animal={an.id} className="w-8 h-8" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{an.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* "MIS AMIGOS" section - Exactly as in user mockup */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs select-none">
        <h4 className="text-xs font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-4 text-center">
          Mis Amigos
        </h4>

        {/* 3 circular avatar friends with first names underneath */}
        <div className="flex items-center justify-around gap-2 mb-4">
          {topFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => { sounds.playPop(); setActiveTab('friends'); }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700/70 p-1.5 border-2 border-slate-200 dark:border-slate-600 shadow-xs group-hover:scale-110 transition-transform flex items-center justify-center">
                <AnimalAvatarIcon animal={friend.avatar} className="w-full h-full" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {friend.firstName}
              </span>
            </div>
          ))}
        </div>

        {/* Ver los 8 amigos link */}
        <button
          onClick={() => { sounds.playPop(); setActiveTab('friends'); }}
          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer transition-colors"
        >
          <span>Ver los {friends.length} amigos</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Adorable little chick and cloud decoration at bottom right - Exactly as in user mockup */}
      <div className="hidden lg:flex items-center justify-end px-3 py-1">
        <div className="relative group cursor-pointer" title="¡Pío pío! Todo está cuidado aquí">
          <svg viewBox="0 0 90 40" fill="none" className="w-24 h-10 opacity-75 group-hover:opacity-100 transition-opacity">
            {/* Soft Cloud */}
            <path
              d="M 50,30 Q 42,30 44,24 Q 44,18 52,18 Q 56,12 66,14 Q 74,12 76,20 Q 84,20 82,28 Q 80,32 72,30 Z"
              fill="#E0E7FF"
              opacity="0.8"
            />
            {/* Cute Yellow Chick */}
            <circle cx="28" cy="22" r="10" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
            <circle cx="34" cy="16" r="7" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
            {/* Chick Eye & Beak */}
            <circle cx="36" cy="15" r="1.5" fill="#1E293B" />
            <polygon points="41,16 45,18 41,20" fill="#F97316" />
            {/* Little Feet */}
            <line x1="26" y1="32" x2="26" y2="36" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="32" x2="30" y2="36" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
            {/* Tiny Sparkle */}
            <polygon points="12,12 13.5,15 16,15 14,17 15,20 12,18 9,20 10,17 8,15 10.5,15" fill="#C084FC" />
          </svg>
        </div>
      </div>
    </aside>
  );
};
