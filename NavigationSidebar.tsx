import React from 'react';
import {
  Home,
  BookOpen,
  Users,
  GraduationCap,
  Image as ImageIcon,
  Video,
  Gamepad2,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  MessageCircle,
  Store,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  activeColor: string;
  textColor: string;
  iconColor: string;
}

export const NavigationSidebar: React.FC = () => {
  const { activeTab, setActiveTab, role, redAlerts } = useApp();

  // Active unread threats count for parents
  const activeAlertsCount = redAlerts.filter((a) => a.status === 'active').length;

  const navItems: NavItem[] = [
    {
      id: 'feed',
      label: 'Inicio',
      icon: Home,
      bgColor: 'bg-blue-100/80 hover:bg-blue-200/90 dark:bg-blue-950/40 dark:hover:bg-blue-900/60',
      activeColor: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-400/30',
      textColor: 'text-blue-800 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'notebook',
      label: 'Mi Cuaderno',
      icon: BookOpen,
      bgColor: 'bg-rose-100/80 hover:bg-rose-200/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/60',
      activeColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-400/30',
      textColor: 'text-rose-800 dark:text-rose-300',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: MessageCircle,
      bgColor: 'bg-fuchsia-100/80 hover:bg-fuchsia-200/90 dark:bg-fuchsia-950/40 dark:hover:bg-fuchsia-900/60',
      activeColor: 'bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white shadow-md shadow-fuchsia-400/30',
      textColor: 'text-fuchsia-800 dark:text-fuchsia-300',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    },
    {
      id: 'friends',
      label: 'Amigos',
      icon: Users,
      bgColor: 'bg-purple-100/80 hover:bg-purple-200/90 dark:bg-purple-950/40 dark:hover:bg-purple-900/60',
      activeColor: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md shadow-purple-400/30',
      textColor: 'text-purple-800 dark:text-purple-300',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'classroom',
      label: 'Mi Clase',
      icon: GraduationCap,
      bgColor: 'bg-emerald-100/80 hover:bg-emerald-200/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60',
      activeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-400/30',
      textColor: 'text-emerald-800 dark:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'photos',
      label: 'Fotos',
      icon: ImageIcon,
      bgColor: 'bg-orange-100/80 hover:bg-orange-200/90 dark:bg-orange-950/40 dark:hover:bg-orange-900/60',
      activeColor: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-400/30',
      textColor: 'text-orange-800 dark:text-orange-300',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Video,
      bgColor: 'bg-amber-100/80 hover:bg-amber-200/90 dark:bg-amber-950/40 dark:hover:bg-amber-900/60',
      activeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-400/30',
      textColor: 'text-amber-900 dark:text-amber-300',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'little-world',
      label: 'Little World',
      icon: Store,
      bgColor: 'bg-emerald-100/80 hover:bg-emerald-200/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60',
      activeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-400/30',
      textColor: 'text-emerald-800 dark:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'games',
      label: 'Juegos',
      icon: Gamepad2,
      bgColor: 'bg-indigo-100/80 hover:bg-indigo-200/90 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60',
      activeColor: 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-400/30',
      textColor: 'text-indigo-900 dark:text-indigo-300',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'learn',
      label: 'Aprender',
      icon: Lightbulb,
      bgColor: 'bg-teal-100/80 hover:bg-teal-200/90 dark:bg-teal-950/40 dark:hover:bg-teal-900/60',
      activeColor: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-400/30',
      textColor: 'text-teal-900 dark:text-teal-300',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <aside className="w-full lg:w-60 shrink-0 select-none">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between h-full">
        <div>
          {/* Header strictly as in mockup */}
          <h2 className="text-xs font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 py-1 mb-2">
            Navegación
          </h2>

          {/* Navigation Pill Buttons: Responsive grid on mobile/tablet, vertical sidebar on lg */}
          <nav className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 sm:gap-3.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all duration-150 cursor-pointer text-left kid-btn ${
                    isActive ? item.activeColor : `${item.bgColor} ${item.textColor}`
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${isActive ? 'text-white' : item.iconColor}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Parent Dashboard Button (Highlighted for Parent Role) */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 pt-1 lg:pt-2 lg:mt-2 lg:border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => setActiveTab('parent-dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer text-left ${
                  activeTab === 'parent-dashboard'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-purple-500" />
                  <span className="truncate">Panel Padres</span>
                </div>
                {activeAlertsCount > 0 && (
                  <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                    {activeAlertsCount}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Cute Sleeping Kitten Illustration in bottom left - Exactly as shown in the mockup image */}
        <div className="hidden lg:flex items-center justify-center pt-4 pb-1">
          <div className="relative group cursor-pointer" title="¡Miau! ClukyBook es seguro para ti">
            <svg viewBox="0 0 80 50" fill="none" className="w-20 h-12 opacity-80 group-hover:opacity-100 transition-opacity">
              {/* Cute sleeping kitten body */}
              <ellipse cx="40" cy="30" rx="26" ry="16" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1.5" />
              {/* Head */}
              <ellipse cx="22" cy="24" rx="14" ry="12" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1.5" />
              {/* Ears */}
              <polygon points="12,14 18,22 10,22" fill="#F472B6" />
              <polygon points="26,14 32,22 24,22" fill="#F472B6" />
              {/* Sleeping happy eyes */}
              <path d="M 16,24 Q 19,27 22,24" stroke="#DB2777" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 23,24 Q 26,27 29,24" stroke="#DB2777" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Nose */}
              <circle cx="21" cy="28" r="1.5" fill="#DB2777" />
              {/* Curled Tail */}
              <path d="M 66,30 Q 72,24 68,18" stroke="#F472B6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Tiny little star */}
              <path d="M 32,10 L 33,13 L 36,13 L 33.5,15 L 34.5,18 L 32,16 L 29.5,18 L 30.5,15 L 28,13 L 31,13 Z" fill="#FBBF24" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
};
