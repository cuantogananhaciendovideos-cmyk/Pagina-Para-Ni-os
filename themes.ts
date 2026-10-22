import { NotebookTheme } from '../types';

export interface ThemeConfig {
  id: NotebookTheme;
  name: string;
  gradient: string;
  primaryBg: string;
  primaryText: string;
  accentBg: string;
  borderAccent: string;
  lightBg: string;
  pillColor: string;
  bannerGradient: string;
}

export const THEME_CONFIGS: Record<NotebookTheme, ThemeConfig> = {
  'pink-purple': {
    id: 'pink-purple',
    name: 'Rosa & Violeta',
    gradient: 'from-pink-400 via-rose-300 to-purple-400',
    primaryBg: 'bg-rose-500',
    primaryText: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-100 dark:bg-rose-950/40',
    borderAccent: 'border-rose-300 dark:border-rose-700',
    lightBg: 'bg-rose-50/70 dark:bg-rose-950/20',
    pillColor: '#F43F5E',
    bannerGradient: 'from-pink-200 via-purple-200 to-indigo-200 dark:from-pink-900/40 dark:via-purple-900/40 dark:to-indigo-900/40',
  },
  'sky-blue': {
    id: 'sky-blue',
    name: 'Azul Cielo & Océano',
    gradient: 'from-sky-400 via-cyan-300 to-blue-500',
    primaryBg: 'bg-sky-500',
    primaryText: 'text-sky-600 dark:text-sky-400',
    accentBg: 'bg-sky-100 dark:bg-sky-950/40',
    borderAccent: 'border-sky-300 dark:border-sky-700',
    lightBg: 'bg-sky-50/70 dark:bg-sky-950/20',
    pillColor: '#0EA5E9',
    bannerGradient: 'from-sky-200 via-blue-200 to-teal-200 dark:from-sky-900/40 dark:via-blue-900/40 dark:to-teal-900/40',
  },
  'mint-green': {
    id: 'mint-green',
    name: 'Verde Menta & Selva',
    gradient: 'from-emerald-400 via-teal-300 to-green-500',
    primaryBg: 'bg-emerald-500',
    primaryText: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    borderAccent: 'border-emerald-300 dark:border-emerald-700',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    pillColor: '#10B981',
    bannerGradient: 'from-emerald-200 via-green-200 to-teal-200 dark:from-emerald-900/40 dark:via-green-900/40 dark:to-teal-900/40',
  },
  'sun-yellow': {
    id: 'sun-yellow',
    name: 'Amarillo Sol & Miel',
    gradient: 'from-amber-400 via-yellow-300 to-orange-400',
    primaryBg: 'bg-amber-500',
    primaryText: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-100 dark:bg-amber-950/40',
    borderAccent: 'border-amber-300 dark:border-amber-700',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/20',
    pillColor: '#F59E0B',
    bannerGradient: 'from-amber-200 via-yellow-200 to-orange-200 dark:from-amber-900/40 dark:via-yellow-900/40 dark:to-orange-900/40',
  },
  'magic-purple': {
    id: 'magic-purple',
    name: 'Morado Mágico & Estrellas',
    gradient: 'from-violet-500 via-purple-400 to-indigo-500',
    primaryBg: 'bg-violet-600',
    primaryText: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-100 dark:bg-violet-950/40',
    borderAccent: 'border-violet-300 dark:border-violet-700',
    lightBg: 'bg-violet-50/70 dark:bg-violet-950/20',
    pillColor: '#8B5CF6',
    bannerGradient: 'from-violet-200 via-purple-200 to-fuchsia-200 dark:from-violet-900/40 dark:via-purple-900/40 dark:to-fuchsia-900/40',
  },
  'cherry-red': {
    id: 'cherry-red',
    name: 'Rojo Cereza & Corazón',
    gradient: 'from-red-500 via-rose-400 to-pink-500',
    primaryBg: 'bg-red-500',
    primaryText: 'text-red-600 dark:text-red-400',
    accentBg: 'bg-red-100 dark:bg-red-950/40',
    borderAccent: 'border-red-300 dark:border-red-700',
    lightBg: 'bg-red-50/70 dark:bg-red-950/20',
    pillColor: '#EF4444',
    bannerGradient: 'from-red-200 via-rose-200 to-orange-200 dark:from-red-900/40 dark:via-rose-900/40 dark:to-orange-900/40',
  },
  'peach-orange': {
    id: 'peach-orange',
    name: 'Naranja Melocotón & Dulce',
    gradient: 'from-orange-400 via-amber-300 to-rose-400',
    primaryBg: 'bg-orange-500',
    primaryText: 'text-orange-600 dark:text-orange-400',
    accentBg: 'bg-orange-100 dark:bg-orange-950/40',
    borderAccent: 'border-orange-300 dark:border-orange-700',
    lightBg: 'bg-orange-50/70 dark:bg-orange-950/20',
    pillColor: '#F97316',
    bannerGradient: 'from-orange-200 via-amber-200 to-pink-200 dark:from-orange-900/40 dark:via-amber-900/40 dark:to-pink-900/40',
  },
};
