/**
 * ClukyBook For Kids — Zona de Aprendizaje 📚
 * Agregada el 2026-10-20 a petición de Memento.
 *
 * Incluye:
 *  - ✏️ Traza Letras (aprender a escribir, Canvas + Pointer Events)
 *  - 🔤 Palabras Mágicas (aprender a leer: sílabas y vocabulario, con voz)
 *  - 📖 Cuento en Voz Alta (lectura con SpeechSynthesis + comprensión)
 *  - ➕ Mates Divertidas (matemáticas por nivel de edad)
 *  - 🎨 Club de Talentos (manualidades paso a paso, niños que enseñan a niños)
 *
 * Todo con tecnología abierta y del propio navegador:
 *  - Canvas 2D y Pointer Events (estándares web)
 *  - SpeechSynthesis (voz del sistema, sin servicios externos ni IA propietaria)
 *  - Progreso guardado en localStorage (mismo patrón que el resto de la app)
 *  - canvas-confetti (ISC) y lucide-react (ISC), ya presentes en el proyecto
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Pencil,
  BookOpen,
  Calculator,
  Palette,
  Star,
  Eraser,
  ArrowRight,
  Volume2,
  CheckCircle,
  XCircle,
  Trophy,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';

/* ---------------------------------- Tipos --------------------------------- */

type Level = '5-7' | '8-10' | '11-12';
type LearnTab = 'hub' | 'trace' | 'words' | 'story' | 'math' | 'talent';

interface LearningProgress {
  stars: number;
  traced: number;
  wordsCorrect: number;
  storiesRead: number;
  mathCorrect: number;
  talentsDone: string[];
}

const PROGRESS_KEY = 'cluky_learning_progress_v1';

const loadProgress = (): LearningProgress => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) return { stars: 0, traced: 0, wordsCorrect: 0, storiesRead: 0, mathCorrect: 0, talentsDone: [], ...JSON.parse(saved) };
  } catch { /* respaldo vacío */ }
  return { stars: 0, traced: 0, wordsCorrect: 0, storiesRead: 0, mathCorrect: 0, talentsDone: [] };
};

/* --------------------------- Voz del navegador ---------------------------- */

const speak = (text: string) => {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const chosen = (() => { try { return localStorage.getItem('cluky_language'); } catch { return 'es'; } })();
    u.lang = chosen === 'en' ? 'en-US' : chosen === 'pt' ? 'pt-BR' : 'es-MX';
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  } catch { /* sin voz disponible: el texto sigue visible */ }
};

/* ------------------------------ Vista principal ---------------------------- */

export const LearningView: React.FC = () => {
  const { publishPost, childProfile } = useApp();
  const [tab, setTab] = useState<LearnTab>('hub');
  const [level, setLevel] = useState<Level>('5-7');
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  const award = useCallback((stars: number, patch: Partial<LearningProgress>) => {
    setProgress((p) => ({ ...p, ...patch, stars: p.stars + stars, talentsDone: patch.talentsDone ?? p.talentsDone }));
    if (stars > 0) sounds.playStarCelebration();
  }, []);

  const shareAchievement = (text: string) => {
    publishPost({ type: 'text', content: text });
    sounds.playPop();
  };

  const cards: Array<{ id: LearnTab; emoji: string; title: string; desc: string; color: string; chip: string }> = [
    { id: 'trace', emoji: '✏️', title: 'Traza Letras', desc: 'Aprende a escribir siguiendo las letras con tu dedo o el mouse.', color: 'bg-rose-500', chip: 'Escribir' },
    { id: 'words', emoji: '🔤', title: 'Palabras Mágicas', desc: 'Completa sílabas y palabras. ¡Escúchalas en voz alta!', color: 'bg-sky-500', chip: 'Leer' },
    { id: 'story', emoji: '📖', title: 'Cuento en Voz Alta', desc: 'Un cuento cortito que se lee solo, línea por línea.', color: 'bg-emerald-500', chip: 'Lectura' },
    { id: 'math', emoji: '➕', title: 'Mates Divertidas', desc: 'Sumas, restas y más cuentas con dibujos para contar.', color: 'bg-amber-500', chip: 'Matemáticas' },
    { id: 'talent', emoji: '🎨', title: 'Club de Talentos', desc: 'Manualidades paso a paso enseñadas por otros niños.', color: 'bg-purple-500', chip: 'Manualidades' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full">
      {/* Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 text-white shadow-lg relative overflow-hidden border-4 border-white dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Aprende Jugando • Sin Anuncios</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Zona de Aprendizaje</h2>
            <p className="text-xs sm:text-sm font-semibold text-white/90">
              Leer, escribir, matemáticas y manualidades — todo con 1 clic, {childProfile.firstName}.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-white text-teal-700 font-black text-sm shadow-md flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {progress.stars} estrellitas
            </div>
            {tab !== 'hub' && (
              <button
                onClick={() => { sounds.playPop(); setTab('hub'); }}
                className="px-4 py-2 rounded-2xl bg-teal-900/60 text-white hover:bg-teal-900 font-black text-xs shadow-md cursor-pointer"
              >
                ← Volver a Aprender
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selector de nivel por edad */}
      {tab === 'hub' && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-600 dark:text-slate-300">Mi nivel:</span>
            {(['5-7', '8-10', '11-12'] as Level[]).map((lv) => (
              <button
                key={lv}
                onClick={() => { sounds.playPop(); setLevel(lv); }}
                className={`px-4 py-2 rounded-2xl font-black text-sm cursor-pointer transition-all active:scale-95 ${
                  level === lv
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {lv} años
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div
                key={c.id}
                onClick={() => { sounds.playPop(); setTab(c.id); }}
                className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${c.color} text-white p-2 mb-3 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform shadow-md`}>
                    {c.emoji}
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-xl">{c.chip}</span>
                  <span className="text-xs font-black text-teal-600">¡A jugar! →</span>
                </div>
              </div>
            ))}

            {/* Tarjeta de mi progreso */}
            <div className="rounded-3xl p-5 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-slate-800 border-2 border-teal-300 dark:border-teal-700 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white p-2 mb-3 flex items-center justify-center shadow-md">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-slate-800 dark:text-white">Mi Progreso</h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 mt-2 space-y-1 font-semibold">
                  <li>✏️ Letras trazadas: {progress.traced}</li>
                  <li>🔤 Palabras correctas: {progress.wordsCorrect}</li>
                  <li>📖 Cuentos leídos: {progress.storiesRead}</li>
                  <li>➕ Cuentas correctas: {progress.mathCorrect}</li>
                  <li>🎨 Manualidades hechas: {progress.talentsDone.length}</li>
                </ul>
              </div>
              <button
                onClick={() => shareAchievement(`¡Ya gané ${progress.stars} estrellitas en la Zona de Aprendizaje de ClukyBook! 📚⭐`)}
                className="mt-4 px-4 py-2 rounded-2xl bg-teal-600 text-white font-black text-xs shadow-md cursor-pointer hover:bg-teal-500 active:scale-95 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Compartir mi logro
              </button>
            </div>
          </div>
        </>
      )}

      {tab === 'trace' && <TraceLetters onDone={(n) => award(1, { traced: progress.traced + n })} />}
      {tab === 'words' && <WordsGame level={level} onFinish={(correct) => award(Math.floor(correct / 3), { wordsCorrect: progress.wordsCorrect + correct })} />}
      {tab === 'story' && <StoryTime onFinish={() => award(1, { storiesRead: progress.storiesRead + 1 })} />}
      {tab === 'math' && <MathGame level={level} onFinish={(correct) => award(Math.floor(correct / 3), { mathCorrect: progress.mathCorrect + correct })} />}
      {tab === 'talent' && (
        <TalentClub
          done={progress.talentsDone}
          onDone={(id) => award(1, { talentsDone: [...progress.talentsDone, id] })}
          onShare={(title) => shareAchievement(`¡Hice la manualidad "${title}" del Club de Talentos de ClukyBook! 🎨✨`)}
        />
      )}
    </div>
  );
};

/* ------------------------------ ✏️ Traza Letras ----------------------------- */

const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const TraceLetters: React.FC<{ onDone: (n: number) => void }> = ({ onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [idx, setIdx] = useState(0);
  const [color, setColor] = useState('#e11d48');
  const [hasDrawn, setHasDrawn] = useState(false);
  const letter = LETTERS[idx];

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = Math.min(parent.clientWidth, 560);
    canvas.width = w;
    canvas.height = Math.round(w * 0.62);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, [idx]);

  useEffect(() => { setupCanvas(); }, [setupCanvas]);

  const pos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const finishLetter = () => {
    if (!hasDrawn) return;
    sounds.playStarCelebration();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    onDone(1);
    setIdx((i) => (i + 1) % LETTERS.length);
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
      <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
        <Pencil className="w-5 h-5 text-rose-500" /> Traza la letra con tu dedo o el mouse
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
        Sigue la letra gigante de guía. Cuando termines, toca «¡Terminé!» y gana una estrellita.
      </p>

      <div className="relative w-full max-w-[560px] mx-auto rounded-3xl bg-rose-50 dark:bg-slate-900 overflow-hidden border-2 border-dashed border-rose-300 dark:border-slate-600 touch-none">
        <div
          className="absolute inset-0 flex items-center justify-center font-black pointer-events-none select-none"
          style={{ fontSize: 'min(38vw, 240px)', color: 'transparent', WebkitTextStroke: '3px rgba(100,116,139,0.45)' }}
        >
          {letter}
        </div>
        <canvas
          ref={canvasRef}
          className="relative w-full block cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={() => { drawing.current = false; }}
          onPointerLeave={() => { drawing.current = false; }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        {['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed'].map((c) => (
          <button
            key={c}
            onClick={() => { sounds.playPop(); setColor(c); }}
            className={`w-9 h-9 rounded-full cursor-pointer border-4 ${color === c ? 'border-slate-800 dark:border-white scale-110' : 'border-white shadow'}`}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
        <button
          onClick={() => { sounds.playPop(); setupCanvas(); }}
          className="px-4 py-2 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <Eraser className="w-4 h-4" /> Borrar
        </button>
        <button
          onClick={() => { sounds.playPop(); speak(`Letra ${letter}`); }}
          className="px-4 py-2 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-black text-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <Volume2 className="w-4 h-4" /> Escuchar la letra
        </button>
        <button
          onClick={finishLetter}
          disabled={!hasDrawn}
          className="px-5 py-2 rounded-2xl bg-rose-500 text-white font-black text-xs cursor-pointer shadow-md disabled:opacity-40 flex items-center gap-1.5 active:scale-95"
        >
          ¡Terminé! <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-center text-xs font-bold text-slate-400 mt-3">Letra {idx + 1} de {LETTERS.length}</p>
    </div>
  );
};

/* ---------------------------- 🔤 Palabras Mágicas --------------------------- */

interface WordQ { emoji: string; display: string; options: string[]; answer: string; speakText: string; }

const WORD_BANK: Record<Level, WordQ[]> = {
  '5-7': [
    { emoji: '🍎', display: 'MAN__NA', options: ['ZA', 'SA', 'TA'], answer: 'ZA', speakText: 'Manzana' },
    { emoji: '🐶', display: '__RRO', options: ['PE', 'PA', 'PO'], answer: 'PE', speakText: 'Perro' },
    { emoji: '🌞', display: 'S__', options: ['OL', 'AL', 'EL'], answer: 'OL', speakText: 'Sol' },
    { emoji: '🐱', display: 'GA__', options: ['TO', 'TA', 'TE'], answer: 'TO', speakText: 'Gato' },
    { emoji: '🌙', display: 'LU__', options: ['NA', 'NE', 'NO'], answer: 'NA', speakText: 'Luna' },
    { emoji: '🐠', display: '__Z', options: ['PE', 'PA', 'PI'], answer: 'PE', speakText: 'Pez' },
    { emoji: '🌸', display: 'FL__', options: ['OR', 'AR', 'ER'], answer: 'OR', speakText: 'Flor' },
    { emoji: '🚗', display: 'CO__E', options: ['CH', 'SH', 'LL'], answer: 'CH', speakText: 'Coche' },
  ],
  '8-10': [
    { emoji: '🦋', display: 'MARI__SA', options: ['PO', 'PA', 'PE'], answer: 'PO', speakText: 'Mariposa' },
    { emoji: '🐘', display: 'ELEFAN__', options: ['TE', 'TA', 'TO'], answer: 'TE', speakText: 'Elefante' },
    { emoji: '📚', display: 'BIBLIO__CA', options: ['TE', 'TA', 'TI'], answer: 'TE', speakText: 'Biblioteca' },
    { emoji: '🚀', display: 'COHE__', options: ['TE', 'TA', 'TO'], answer: 'TE', speakText: 'Cohete' },
    { emoji: '🌈', display: 'ARCO__IS', options: ['ÍR', 'IR', 'ER'], answer: 'ÍR', speakText: 'Arcoíris' },
    { emoji: '🦁', display: '¿Qué palabra significa lo mismo que CONTENTO?', options: ['Feliz', 'Enojado', 'Dormido'], answer: 'Feliz', speakText: 'Feliz significa lo mismo que contento' },
    { emoji: '❄️', display: '¿Cuál es lo contrario de CALIENTE?', options: ['Frío', 'Grande', 'Rápido'], answer: 'Frío', speakText: 'Frío es lo contrario de caliente' },
    { emoji: '✏️', display: '¿Con qué escribimos en el cuaderno?', options: ['Lápiz', 'Tenedor', 'Zapato'], answer: 'Lápiz', speakText: 'Escribimos con el lápiz' },
  ],
  '11-12': [
    { emoji: '💡', display: '¿Qué significa GENEROSO?', options: ['Que comparte lo que tiene', 'Que corre muy rápido', 'Que duerme mucho'], answer: 'Que comparte lo que tiene', speakText: 'Generoso es quien comparte lo que tiene' },
    { emoji: '🏃', display: '¿Cuál es un sinónimo de VELOZ?', options: ['Rápido', 'Lento', 'Silencioso'], answer: 'Rápido', speakText: 'Veloz y rápido significan lo mismo' },
    { emoji: '📖', display: '¿Cómo se llama quien escribe cuentos?', options: ['Escritor', 'Pintor', 'Cantante'], answer: 'Escritor', speakText: 'Quien escribe cuentos es un escritor' },
    { emoji: '🌋', display: '¿Qué palabra está bien escrita?', options: ['Volcán', 'Bolcán', 'Volkán'], answer: 'Volcán', speakText: 'Volcán se escribe con V y acento en la A' },
    { emoji: '🦉', display: '¿Cuál es un antónimo de VALIENTE?', options: ['Cobarde', 'Fuerte', 'Alegre'], answer: 'Cobarde', speakText: 'Cobarde es lo contrario de valiente' },
    { emoji: '✍️', display: 'Completa: "Ayer yo ___ al parque."', options: ['fui', 'fue', 'fueron'], answer: 'fui', speakText: 'Ayer yo fui al parque' },
  ],
};

const QuizShell: React.FC<{
  title: string;
  icon: React.ReactNode;
  questions: Array<{ emoji: string; display: string; options: string[]; answer: string; speakText: string; visual?: string }>;
  onFinish: (correct: number) => void;
}> = ({ title, icon, questions, onFinish }) => {
  const [order] = useState(() => [...questions].sort(() => Math.random() - 0.5));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const q = order[i];

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      onFinish(correct);
      if (correct >= Math.ceil(order.length / 2)) {
        sounds.playStarCelebration();
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      }
    }
  }, [done, correct, onFinish, order.length]);

  if (done) {
    return (
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/80 text-center">
        <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-black text-slate-800 dark:text-white">¡Terminaste!</h3>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
          Acertaste {correct} de {order.length}. {correct >= Math.ceil(order.length / 2) ? '¡Ganaste estrellitas! ⭐' : 'Sigue practicando, tú puedes.'}
        </p>
      </div>
    );
  }

  const pick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) {
      setCorrect((c) => c + 1);
      sounds.playStarCelebration();
    } else {
      sounds.playPop();
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">{icon} {title}</h3>
        <span className="text-xs font-black text-slate-400">Pregunta {i + 1} de {order.length} • ✓ {correct}</span>
      </div>

      <div className="text-center py-4">
        <div className="text-6xl mb-3">{q.emoji}</div>
        {q.visual && <div className="text-2xl tracking-widest mb-2 select-none">{q.visual}</div>}
        <div className="text-2xl sm:text-3xl font-black tracking-wide text-slate-800 dark:text-white break-words">{q.display}</div>
        <button
          onClick={() => speak(q.speakText)}
          className="mt-3 px-4 py-2 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-black text-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
        >
          <Volume2 className="w-4 h-4" /> Escucharlo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        {q.options.map((opt) => {
          const isAnswer = picked && opt === q.answer;
          const isWrong = picked === opt && opt !== q.answer;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`px-4 py-4 rounded-2xl font-black text-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isAnswer
                  ? 'bg-emerald-500 text-white shadow-md'
                  : isWrong
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {opt}
              {isAnswer && <CheckCircle className="w-5 h-5" />}
              {isWrong && <XCircle className="w-5 h-5" />}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="text-center mt-4">
          <p className="text-sm font-black mb-3" style={{ color: picked === q.answer ? '#059669' : '#e11d48' }}>
            {picked === q.answer ? '¡Muy bien! 🎉' : `Casi… la respuesta era: ${q.answer}`}
          </p>
          <button
            onClick={() => { sounds.playPop(); setPicked(null); if (i + 1 >= order.length) setDone(true); else setI(i + 1); }}
            className="px-6 py-2.5 rounded-2xl bg-teal-600 text-white font-black text-sm cursor-pointer shadow-md active:scale-95"
          >
            {i + 1 >= order.length ? 'Ver mi resultado 🏆' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  );
};

const WordsGame: React.FC<{ level: Level; onFinish: (correct: number) => void }> = ({ level, onFinish }) => (
  <QuizShell
    title="Palabras Mágicas"
    icon={<BookOpen className="w-5 h-5 text-sky-500" />}
    questions={WORD_BANK[level]}
    onFinish={onFinish}
  />
);

/* ----------------------------- 📖 Cuento en Voz Alta ------------------------ */

const STORIES = [
  {
    title: 'El zorrito y la luna',
    emoji: '🦊',
    lines: [
      'Había una vez un zorrito pequeño que soñaba con tocar la luna.',
      'Una noche subió a la colina más alta y estiró su patita.',
      'La luna brilló fuerte y el zorrito entendió algo bonito:',
      'los sueños se alcanzan poquito a poquito, sin rendirse nunca.',
    ],
    question: '¿Qué aprendió el zorrito?',
    options: ['Que los sueños se logran poco a poco', 'Que la luna es de queso', 'Que no hay que dormir'],
    answer: 'Que los sueños se logran poco a poco',
  },
  {
    title: 'La semillita valiente',
    emoji: '🌱',
    lines: [
      'Una semillita cayó en la tierra y tuvo un poquito de miedo.',
      'El sol la calentó y la lluvia la regó con cariño.',
      'Un día, la semillita se estiró y sacó dos hojitas verdes.',
      'Con paciencia, se convirtió en la flor más alegre del jardín.',
    ],
    question: '¿Qué ayudó a la semillita a crecer?',
    options: ['El sol y la lluvia', 'Un videojuego', 'Un sombrero'],
    answer: 'El sol y la lluvia',
  },
  {
    title: 'El tren de los números',
    emoji: '🚂',
    lines: [
      'El tren de los números salía cada mañana de la estación.',
      'En el primer vagón viajaba el uno, muy elegante.',
      'Luego venían el dos, el tres y todos sus amigos contando.',
      'Y así, contando vagones, los niños aprendían a sumar.',
    ],
    question: '¿Qué aprendían los niños con el tren?',
    options: ['A sumar contando vagones', 'A volar', 'A cocinar'],
    answer: 'A sumar contando vagones',
  },
];

const StoryTime: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [storyIdx, setStoryIdx] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [picked, setPicked] = useState<string | null>(null);
  const [counted, setCounted] = useState(false);
  const story = STORIES[storyIdx];

  const readLine = (i: number) => {
    setActiveLine(i);
    speak(story.lines[i]);
    if (i === story.lines.length - 1 && !counted) {
      setCounted(true);
      onFinish();
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" /> {story.emoji} {story.title}
        </h3>
        <div className="flex gap-1.5">
          {STORIES.map((s, i) => (
            <button
              key={s.title}
              onClick={() => { sounds.playPop(); setStoryIdx(i); setActiveLine(-1); setPicked(null); setCounted(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer active:scale-95 ${i === storyIdx ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}
            >
              {s.emoji} Cuento {i + 1}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Toca cada línea y la plataforma la lee en voz alta contigo.</p>

      <div className="space-y-2">
        {story.lines.map((line, i) => (
          <button
            key={i}
            onClick={() => readLine(i)}
            className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-base cursor-pointer transition-all active:scale-[0.99] flex items-center gap-3 ${
              activeLine === i
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-emerald-50 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-5 h-5 shrink-0" /> {line}
          </button>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
        <p className="text-sm font-black text-slate-700 dark:text-slate-200 mb-3">Pregunta del cuento: {story.question}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {story.options.map((opt) => (
            <button
              key={opt}
              onClick={() => { setPicked(opt); if (opt === story.answer) sounds.playStarCelebration(); else sounds.playPop(); }}
              className={`px-3 py-3 rounded-2xl font-bold text-xs cursor-pointer active:scale-95 ${
                picked && opt === story.answer
                  ? 'bg-emerald-500 text-white'
                  : picked === opt
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {picked === story.answer && <p className="text-sm font-black text-emerald-600 mt-3">¡Respuesta correcta! Ganaste una estrellita por leer el cuento. ⭐</p>}
      </div>
    </div>
  );
};

/* ------------------------------ ➕ Mates Divertidas ------------------------- */

interface MathQ { display: string; visual?: string; options: string[]; answer: string; speakText: string; }

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeOptions = (ans: number): string[] => {
  const set = new Set<number>([ans]);
  while (set.size < 3) set.add(Math.max(0, ans + rnd(-4, 5)));
  return [...set].sort(() => Math.random() - 0.5).map(String);
};

const genMath = (level: Level): MathQ[] => {
  const qs: MathQ[] = [];
  for (let k = 0; k < 8; k++) {
    if (level === '5-7') {
      const a = rnd(1, 9); const b = rnd(1, 9);
      if (k % 3 === 2) {
        const big = Math.max(a, b); const small = Math.min(a, b);
        qs.push({ display: `¿Cuánto es ${big} − ${small}?`, options: makeOptions(big - small), answer: String(big - small), speakText: `Cuánto es ${big} menos ${small}` });
      } else {
        const visual = '🍎'.repeat(a) + '  +  ' + '🍌'.repeat(b);
        qs.push({ display: `¿Cuánto es ${a} + ${b}?`, visual, options: makeOptions(a + b), answer: String(a + b), speakText: `Cuánto es ${a} más ${b}` });
      }
    } else if (level === '8-10') {
      const kind = k % 3;
      if (kind === 0) { const a = rnd(12, 60); const b = rnd(5, 40); qs.push({ display: `¿Cuánto es ${a} + ${b}?`, options: makeOptions(a + b), answer: String(a + b), speakText: `Cuánto es ${a} más ${b}` }); }
      else if (kind === 1) { const a = rnd(30, 90); const b = rnd(5, a - 1); qs.push({ display: `¿Cuánto es ${a} − ${b}?`, options: makeOptions(a - b), answer: String(a - b), speakText: `Cuánto es ${a} menos ${b}` }); }
      else { const a = rnd(2, 9); const b = rnd(2, 9); qs.push({ display: `¿Cuánto es ${a} × ${b}?`, options: makeOptions(a * b), answer: String(a * b), speakText: `Cuánto es ${a} por ${b}` }); }
    } else {
      const kind = k % 4;
      if (kind === 0) { const a = rnd(3, 12); const b = rnd(3, 12); qs.push({ display: `¿Cuánto es ${a} × ${b}?`, options: makeOptions(a * b), answer: String(a * b), speakText: `Cuánto es ${a} por ${b}` }); }
      else if (kind === 1) { const b = rnd(2, 9); const ans = rnd(2, 9); const a = b * ans; qs.push({ display: `¿Cuánto es ${a} ÷ ${b}?`, options: makeOptions(ans), answer: String(ans), speakText: `Cuánto es ${a} entre ${b}` }); }
      else if (kind === 2) { qs.push({ display: 'Si una pizza se parte en 4 partes iguales y te comes 1, ¿qué fracción te comiste?', options: ['1/4', '1/2', '4/1'], answer: '1/4', speakText: 'Una parte de cuatro es un cuarto' }); }
      else { const a = rnd(40, 120); const b = rnd(15, 60); qs.push({ display: `¿Cuánto es ${a} − ${b}?`, options: makeOptions(a - b), answer: String(a - b), speakText: `Cuánto es ${a} menos ${b}` }); }
    }
  }
  return qs;
};

const MathGame: React.FC<{ level: Level; onFinish: (correct: number) => void }> = ({ level, onFinish }) => {
  const [questions] = useState<MathQ[]>(() => genMath(level));
  return (
    <QuizShell
      title="Mates Divertidas"
      icon={<Calculator className="w-5 h-5 text-amber-500" />}
      questions={questions.map((q) => ({ emoji: '🔢', ...q }))}
      onFinish={onFinish}
    />
  );
};

/* ------------------------------ 🎨 Club de Talentos -------------------------- */

const TALENTS = [
  {
    id: 'origami-perrito',
    emoji: '🐶',
    title: 'Origami: Perrito de papel',
    teacher: 'Enseña: Mateo, 9 años',
    materials: 'Una hoja cuadrada de papel',
    steps: ['Dobla la hoja en triángulo, punta con punta.', 'Dobla las dos puntas de arriba hacia abajo: ¡esas son las orejas!', 'Dobla la punta de abajo hacia atrás.', 'Dibuja los ojos, la nariz y la boca con un lápiz.', '¡Listo! Ya tienes tu perrito de papel.'],
  },
  {
    id: 'dibujo-zorrito',
    emoji: '🦊',
    title: 'Dibuja un zorrito paso a paso',
    teacher: 'Enseña: Luna, 8 años',
    materials: 'Hoja, lápiz y colores naranja, blanco y negro',
    steps: ['Dibuja un círculo grande para la cabeza.', 'Agrega dos triángulos arriba: las orejas.', 'Dibuja dos puntitos para los ojos y una nariz pequeña.', 'Pinta de naranja la parte de arriba y de blanco la barbilla.', 'Al final, dibuja su cola grande y esponjada.'],
  },
  {
    id: 'plastilina-frutas',
    emoji: '🍓',
    title: 'Frutas de plastilina',
    teacher: 'Enseña: Sofía, 10 años',
    materials: 'Plastilina roja, verde y café (con permiso de un adulto)',
    steps: ['Haz una bolita roja y aplánala un poquito: es la fresa.', 'Con plastilina verde haz una estrellita para las hojas.', 'Pega las hojas arriba de la fresa.', 'Haz puntitos con un palillo (¡con cuidado y ayuda de un adulto!).', 'Repite con otras frutas y arma tu frutero.'],
  },
  {
    id: 'avion-papel',
    emoji: '✈️',
    title: 'El avión de papel campeón',
    teacher: 'Enseña: Diego, 11 años',
    materials: 'Una hoja tamaño carta',
    steps: ['Dobla la hoja por la mitad a lo largo y desdóblala.', 'Dobla las esquinas de arriba hacia la línea del centro.', 'Dobla otra vez los lados hacia el centro.', 'Dobla por la mitad y forma las dos alas parejitas.', 'Lánzalo en un lugar abierto y seguro. ¡A volar!'],
  },
  {
    id: 'tarjeta-mama',
    emoji: '💌',
    title: 'Tarjeta sorpresa para mamá o papá',
    teacher: 'Enseña: Valen, 7 años',
    materials: 'Cartulina, colores y calcomanías',
    steps: ['Dobla la cartulina por la mitad.', 'En la portada dibuja un corazón grande.', 'Adentro escribe: "Gracias por cuidarme" con tu mejor letra.', 'Decora con calcomanías y puntitos de colores.', 'Entrégala con un abrazo fuerte.'],
  },
  {
    id: 'pulsera-papel',
    emoji: '🌈',
    title: 'Pulsera de tiritas de colores',
    teacher: 'Enseña: Emma, 9 años',
    materials: 'Tiras de papel de colores y pegamento en barra',
    steps: ['Corta tiritas de papel de muchos colores (pide ayuda con las tijeras).', 'Pega la punta de la primera tirita formando un anillo.', 'Pasa la segunda tirita por dentro del anillo y pégala.', 'Sigue así, anillo por anillo, hasta que alcance tu muñeca.', 'Pega el último anillo con el primero. ¡Pulsera lista!'],
  },
];

const TalentClub: React.FC<{ done: string[]; onDone: (id: string) => void; onShare: (title: string) => void }> = ({ done, onDone, onShare }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-3xl p-4">
        <p className="text-sm font-bold text-purple-800 dark:text-purple-200 flex items-start gap-2">
          <Sparkles className="w-5 h-5 shrink-0" />
          Aquí los niños enseñan a otros niños. En la versión en línea, cada tutorial nuevo pasa primero por la aprobación de un maestro o de los papás antes de publicarse.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TALENTS.map((t) => {
          const isDone = done.includes(t.id);
          const isOpen = openId === t.id;
          return (
            <div key={t.id} className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="text-4xl">{t.emoji}</div>
                {isDone && <span className="px-2 py-0.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">✓ ¡Ya lo hice!</span>}
              </div>
              <h4 className="text-base font-black text-slate-800 dark:text-white mt-2">{t.title}</h4>
              <p className="text-[11px] font-bold text-purple-500">{t.teacher}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">🧺 Necesitas: {t.materials}</p>

              {isOpen && (
                <ol className="mt-3 space-y-1.5 list-none">
                  {t.steps.map((s, i) => (
                    <li key={i} className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                      <span className="font-black text-purple-500 mr-1.5">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { sounds.playPop(); setOpenId(isOpen ? null : t.id); }}
                  className="flex-1 px-3 py-2 rounded-2xl bg-purple-600 text-white font-black text-xs cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Palette className="w-4 h-4" /> {isOpen ? 'Cerrar pasos' : 'Ver los pasos'}
                </button>
                {!isDone ? (
                  <button
                    onClick={() => { onDone(t.id); confetti({ particleCount: 50, spread: 55, origin: { y: 0.7 } }); }}
                    className="flex-1 px-3 py-2 rounded-2xl bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-md active:scale-95"
                  >
                    ¡Yo lo intenté! ⭐
                  </button>
                ) : (
                  <button
                    onClick={() => onShare(t.title)}
                    className="flex-1 px-3 py-2 rounded-2xl bg-white dark:bg-slate-700 border-2 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-300 font-black text-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" /> Compartir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
