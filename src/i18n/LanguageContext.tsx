/**
 * ClukyBook For Kids — Idiomas ES / EN / PT (2026-10-20)
 * Botón de Idiomas y contexto global. El idioma elegido se guarda
 * en el dispositivo (localStorage) y se aplica a TODA la plataforma
 * con el motor de traducción en vivo (domTranslator).
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { applyLanguage, Language } from './domTranslator';

export type { Language };

const STORAGE_KEY = 'cluky_language';

const TITLES: Record<Language, string> = {
  es: 'ClukyBook For Kids — El Cuaderno Vivo seguro para niños',
  en: 'ClukyBook For Kids — The safe Living Notebook for kids',
  pt: 'ClukyBook For Kids — O Caderno Vivo seguro para crianças',
};

const HTML_LANG: Record<Language, string> = { es: 'es', en: 'en', pt: 'pt-BR' };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({ language: 'es', setLanguage: () => {} });

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'pt' || saved === 'es') return saved;
    } catch { /* sin almacenamiento */ }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* modo privado */ }
  };

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[language];
    document.title = TITLES[language];
    // Pequeña espera: deja que React pinte antes de traducir el DOM
    const t = setTimeout(() => applyLanguage(language), 30);
    return () => clearTimeout(t);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

/** Botón de Idiomas: ES | EN | PT */
export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const options: Array<{ id: Language; label: string; flag: string }> = [
    { id: 'es', label: 'ES', flag: '🇲🇽' },
    { id: 'en', label: 'EN', flag: '🇺🇸' },
    { id: 'pt', label: 'PT', flag: '🇧🇷' },
  ];
  return (
    <div
      className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-1 shadow-xs"
      title="Idiomas / Languages / Idiomas"
    >
      <Globe className="w-4 h-4 text-teal-600 dark:text-teal-300 ml-1.5 shrink-0" />
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setLanguage(opt.id)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 ${
            language === opt.id
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          aria-label={`Idioma: ${opt.label}`}
        >
          {opt.flag} {opt.label}
        </button>
      ))}
    </div>
  );
};
