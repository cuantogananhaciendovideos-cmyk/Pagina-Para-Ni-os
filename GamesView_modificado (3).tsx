import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Sparkles,
  Paintbrush,
  Music,
  CheckCircle,
  Star,
  Download,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { AnimalAvatar } from '../types';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';

export const GamesView: React.FC = () => {
  const { publishPost, childProfile } = useApp();
  const [selectedGame, setSelectedGame] = useState<'hub' | 'memory' | 'paint' | 'music' | 'stars' | 'hands'>('hub');

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden border-4 border-white dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-1">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Juegos Seguros • 100% Sin Compras ni Anuncios</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Zona de Juegos y Creatividad</h2>
            <p className="text-xs sm:text-sm font-semibold text-white/90">
              Juegos educativos pensados para divertirte, aprender y ganar estrellitas.
            </p>
          </div>

          {selectedGame !== 'hub' && (
            <button
              onClick={() => { sounds.playPop(); setSelectedGame('hub'); }}
              className="px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs shadow-md cursor-pointer shrink-0"
            >
              ← Volver al Menú de Juegos
            </button>
          )}
        </div>
      </div>

      {/* Main Game Hub */}
      {selectedGame === 'hub' && (
        <div className="flex flex-col gap-4">
          {/* ACCESO DIRECTO DESTACADO: JUEGO CON MANOS Y CÁMARA */}
          <button
            type="button"
            onClick={() => { sounds.playPop(); setSelectedGame('hands'); }}
            className="w-full rounded-3xl border-4 border-cyan-400 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 p-5 text-left text-white shadow-lg transition hover:brightness-105 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-cyan-300"
          >
            <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">🤏 🖐️</span>
                <span>
                  <span className="block text-lg font-black">Game With Hands &amp; Camera 📸</span>
                  <span className="block text-sm font-semibold text-white/95">¡Nuevo! Juega usando los gestos de tus manos y la cámara.</span>
                </span>
              </span>
              <span className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-black text-cyan-700 shadow">ABRIR JUEGO →</span>
            </span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Game 1: Memorama */}
          <div
            onClick={() => { sounds.playPop(); setSelectedGame('memory'); }}
            className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 p-2 mb-3 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform">
                🎴
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Memorama
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Encuentra parejas de zorritos y pandas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-xl">
                ⭐ +5 Estrellas
              </span>
              <span className="text-xs font-black text-rose-600">¡Jugar! →</span>
            </div>
          </div>

          {/* Game 2: Mini Videojuego - Atrapa Estrellitas */}
          <div
            onClick={() => { sounds.playPop(); setSelectedGame('stars'); }}
            className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border-2 border-indigo-400 dark:border-indigo-600 shadow-md flex flex-col justify-between hover:scale-105 active:scale-95 transition-all cursor-pointer group bg-gradient-to-b from-indigo-50/40 to-transparent dark:from-indigo-950/20"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white p-2 mb-3 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform shadow-md shadow-indigo-400/40">
                ⭐
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black uppercase mb-1">
                ¡Nuevo Videojuego!
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Atrapa las Estrellitas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mueve a Cluky para atrapar las estrellas que caen.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-xl">
                🎮 Arcade
              </span>
              <span className="text-xs font-black text-indigo-600">¡Jugar! →</span>
            </div>
          </div>

          {/* Game 3: Pintorcito Mágico */}
          <div
            onClick={() => { sounds.playPop(); setSelectedGame('paint'); }}
            className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 p-2 mb-3 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform">
                🎨
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Pintorcito Mágico
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dibuja y guarda en tu cuaderno con 1 clic.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-xl">
                🖌️ Arte
              </span>
              <span className="text-xs font-black text-emerald-600">¡Dibujar! →</span>
            </div>
          </div>

          {/* Game 4: Música de la Granja */}
          <div
            onClick={() => { sounds.playPop(); setSelectedGame('music'); }}
            className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 p-2 mb-3 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform">
                🎹
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Música Granja
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Piano con sonidos reales de animalitos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-xl">
                🎶 Piano
              </span>
              <span className="text-xs font-black text-amber-600">¡Tocar! →</span>
            </div>
          </div>

          {/* Game 5: Control por gestos de la mano */}
          <div
            onClick={() => { sounds.playPop(); setSelectedGame('hands'); }}
            className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-5 border-2 border-cyan-400 dark:border-cyan-600 shadow-md flex flex-col justify-between hover:scale-105 active:scale-95 transition-all cursor-pointer group bg-gradient-to-b from-cyan-50/50 to-transparent dark:from-cyan-950/20"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white p-2 mb-3 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform shadow-md shadow-cyan-400/40">
                🖐️
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[9px] font-black uppercase mb-1">
                ¡Manos libres!
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Game With Hands & Camera 🤏 🖐️📸
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Controla el juego con gestos de tus manos frente a la cámara. Los demás juegos siguen disponibles en este menú.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-xl">
                📷 Cámara
              </span>
              <span className="text-xs font-black text-cyan-700">¡Probar! →</span>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* GAME 1: MEMORAMA */}
      {selectedGame === 'memory' && <MemoryGame />}

      {/* GAME 2: MINI VIDEOJUEGO DE ESTRELLITAS */}
      {selectedGame === 'stars' && <StarCatcherGame />}

      {/* GAME 3: PINTORCITO MAGICO */}
      {selectedGame === 'paint' && <PaintGame />}

      {/* GAME 4: MUSICA DE LA GRANJA */}
      {selectedGame === 'music' && <MusicGame />}

      {/* GAME 5: CONTROL DE JUEGOS CON GESTOS */}
      {selectedGame === 'hands' && (
        <div className="w-full rounded-3xl overflow-hidden border-2 border-cyan-200 dark:border-cyan-800 bg-slate-950 shadow-xl">
          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/50">
            <h3 className="text-lg font-black text-cyan-900 dark:text-cyan-100">🤏 🖐️ Game With Hands & Camera 📸</h3>
            <p className="text-sm text-cyan-800 dark:text-cyan-200">
              Permite el acceso a la cámara. Apunta con el índice y mantén el dedo sobre un botón durante un momento, o haz una pinza con los dedos.
            </p>
          </div>
          <iframe
            src="/Botones-Con-La-Mano-v2-EnLaCamara.html"
            title="Game With Hands & Camera: controles por gestos de la mano"
            allow="camera; autoplay"
            className="block w-full border-0 bg-slate-950"
            style={{ height: 'min(78vh, 760px)', minHeight: '540px' }}
          />
        </div>
      )}
    </div>
  );
};

/* --- MINI VIDEOJUEGO DE ESTRELLITAS (STAR CATCHER ARCADE) --- */
const StarCatcherGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerXRef = useRef(260);
  const starsRef = useRef<Array<{ x: number; y: number; speed: number; size: number }>>([]);
  const animFrameIdRef = useRef<number | null>(null);

  const startStarGame = () => {
    sounds.playPop();
    setScore(0);
    setHasWon(false);
    setIsPlaying(true);
    playerXRef.current = 260;
    starsRef.current = [
      { x: 100, y: 0, speed: 2.2, size: 24 },
      { x: 250, y: -80, speed: 2.5, size: 24 },
      { x: 400, y: -160, speed: 2.0, size: 24 },
    ];
  };

  useEffect(() => {
    startStarGame();
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  const movePlayer = (dir: 'left' | 'right') => {
    if (dir === 'left') {
      playerXRef.current = Math.max(40, playerXRef.current - 50);
    } else {
      playerXRef.current = Math.min(480, playerXRef.current + 50);
    }
  };

  useEffect(() => {
    if (!isPlaying || hasWon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localScore = score;

    const loop = () => {
      // Clear canvas with night sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 360);
      grad.addColorStop(0, '#1E1B4B');
      grad.addColorStop(1, '#312E81');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 520, 360);

      // Draw starry background dots
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 20; i++) {
        const x = (i * 37) % 520;
        const y = (i * 53) % 320;
        ctx.fillRect(x, y, 2, 2);
      }

      // Update & Draw falling stars
      starsRef.current.forEach((st) => {
        st.y += st.speed;

        // Draw star
        ctx.save();
        ctx.translate(st.x, st.y);
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        // 5-point star
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 16, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 16);
          ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 8, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 8);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Check catch collision with Cluky basket at bottom (y = 300)
        if (st.y >= 290 && st.y <= 330 && Math.abs(st.x - playerXRef.current) < 45) {
          sounds.playStarCelebration();
          localScore += 1;
          setScore(localScore);
          st.y = -40;
          st.x = Math.random() * 440 + 40;

          if (localScore >= 10) {
            setHasWon(true);
            setIsPlaying(false);
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }
        }

        // Reset star if dropped
        if (st.y > 360) {
          st.y = -30;
          st.x = Math.random() * 440 + 40;
        }
      });

      // Draw Cluky the fox catcher at playerXRef.current, y = 310
      const px = playerXRef.current;
      const py = 310;

      // Cute Basket
      ctx.fillStyle = '#E26D38';
      ctx.beginPath();
      ctx.ellipse(px, py, 38, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute white inner cheeks
      ctx.fillStyle = '#FFF6ED';
      ctx.beginPath();
      ctx.ellipse(px, py + 2, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#E26D38';
      ctx.beginPath();
      ctx.moveTo(px - 28, py - 10);
      ctx.lineTo(px - 14, py - 32);
      ctx.lineTo(px, py - 10);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(px, py - 10);
      ctx.lineTo(px + 14, py - 32);
      ctx.lineTo(px + 28, py - 10);
      ctx.fill();

      // Cute Eyes
      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath();
      ctx.arc(px - 10, py - 2, 3, 0, Math.PI * 2);
      ctx.arc(px + 10, py - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, hasWon]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    playerXRef.current = Math.max(40, Math.min(480, x));
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    playerXRef.current = Math.max(40, Math.min(480, x));
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-lg mb-3">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-1.5">
            <span>Atrapa las Estrellitas de Cluky</span>
            <span className="text-xs bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">Arcade</span>
          </h3>
          <p className="text-xs text-slate-500">Mueve con el mouse, toque o botones</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-100 text-amber-800 font-black text-sm flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{score} / 10</span>
          </div>

          <button
            onClick={startStarGame}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
          </button>
        </div>
      </div>

      {hasWon ? (
        <div className="w-full max-w-lg p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 text-center animate-bounce mb-4">
          <h4 className="text-2xl font-black text-amber-700 dark:text-amber-300">¡GANASTE! ⭐⭐⭐</h4>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 mb-3">
            ¡Atrapaste 10 estrellas doradas con el zorrito Cluky!
          </p>
          <button
            onClick={startStarGame}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md cursor-pointer"
          >
            ¡Jugar otra partida! 🚀
          </button>
        </div>
      ) : null}

      {/* Canvas */}
      <div className="rounded-3xl overflow-hidden border-4 border-indigo-300 dark:border-indigo-800 shadow-xl bg-indigo-950">
        <canvas
          ref={canvasRef}
          width={520}
          height={360}
          onMouseMove={handleCanvasMouseMove}
          onTouchMove={handleCanvasTouchMove}
          className="cursor-pointer touch-none block"
        />
      </div>

      {/* Big On-screen Touch Controls for 5-Year-Olds */}
      <div className="flex items-center justify-between w-full max-w-md mt-4 gap-4">
        <button
          onClick={() => { sounds.playPop(); movePlayer('left'); }}
          className="flex-1 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-90 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
          <span>Mover Izquierda</span>
        </button>

        <button
          onClick={() => { sounds.playPop(); movePlayer('right'); }}
          className="flex-1 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-90 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform"
        >
          <span>Mover Derecha</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

/* --- MEMORY GAME SUB-COMPONENT --- */
const MemoryGame: React.FC = () => {
  const cardsTemplate: AnimalAvatar[] = ['fox', 'panda', 'rabbit', 'owl', 'lion', 'cat'];
  const [cards, setCards] = useState<Array<{ id: number; animal: AnimalAvatar; isFlipped: boolean; isMatched: boolean }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  const startNewGame = () => {
    sounds.playPop();
    const paired = [...cardsTemplate, ...cardsTemplate]
      .sort(() => Math.random() - 0.5)
      .map((animal, idx) => ({
        id: idx,
        animal,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(paired);
    setFlippedIndices([]);
    setMoves(0);
    setHasWon(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

    sounds.playPop();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].animal === cards[second].animal) {
        sounds.playStarCelebration();
        setTimeout(() => {
          newCards[first].isMatched = true;
          newCards[second].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);

          // Check win
          if (newCards.every((c) => c.isMatched)) {
            setHasWon(true);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
        }, 400);
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-md mb-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Memorama de Animalitos</h3>
          <p className="text-xs text-slate-500">Movimientos: {moves}</p>
        </div>
        <button
          onClick={startNewGame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
        </button>
      </div>

      {hasWon && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-center animate-bounce">
          <h4 className="text-lg font-black text-amber-700 dark:text-amber-300">¡Ganaste! ⭐⭐⭐</h4>
          <p className="text-xs text-amber-600 dark:text-amber-400">¡Excelente memoria! Has ganado 5 estrellitas.</p>
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-w-md w-full">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className={`aspect-square rounded-2xl p-2.5 flex items-center justify-center transition-all duration-200 cursor-pointer text-2xl ${
              card.isFlipped || card.isMatched
                ? 'bg-white dark:bg-slate-900 border-2 border-indigo-400 scale-100 shadow-md'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <AnimalAvatarIcon animal={card.animal} className="w-12 h-12" />
            ) : (
              <span className="text-2xl font-black">★</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/* --- PAINT GAME SUB-COMPONENT --- */
const PaintGame: React.FC = () => {
  const { publishPost, childProfile } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#EF4444');
  const [lineWidth, setLineWidth] = useState(8);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const colors = ['#EF4444', '#F97316', '#FBBF24', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#1E293B'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    sounds.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveToNotebook = () => {
    sounds.playStarCelebration();
    confetti({ particleCount: 70, spread: 60 });
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : '';

    publishPost({
      type: 'photo',
      content: `¡Miren la obra de arte que pinté en el Pintorcito Mágico de ClukyBook! 🎨✨`,
      mediaUrl: dataUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-between w-full max-w-lg mb-3 gap-2">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Pintorcito Mágico</h3>
          <p className="text-xs text-slate-500">Dibuja libremente y guarda en tu cuaderno con 1 clic</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Borrar
          </button>
          <button
            onClick={handleSaveToNotebook}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Guardar en Mi Cuaderno
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs animate-in fade-in">
          ¡Guardado y publicado en tu cuaderno con éxito! ⭐
        </div>
      )}

      {/* Palette */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto p-1">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => { sounds.playPop(); setColor(c); }}
            style={{ backgroundColor: c }}
            className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
              color === c ? 'scale-125 ring-3 ring-indigo-400' : 'hover:scale-110'
            }`}
          />
        ))}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <button
          onClick={() => setLineWidth(4)}
          className={`px-2 py-1 text-xs font-bold rounded-lg ${lineWidth === 4 ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}
        >
          Fino
        </button>
        <button
          onClick={() => setLineWidth(8)}
          className={`px-2 py-1 text-xs font-bold rounded-lg ${lineWidth === 8 ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}
        >
          Medio
        </button>
        <button
          onClick={() => setLineWidth(16)}
          className={`px-2 py-1 text-xs font-bold rounded-lg ${lineWidth === 16 ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}
        >
          Grueso
        </button>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-inner bg-white">
        <canvas
          ref={canvasRef}
          width={520}
          height={320}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};

/* --- MUSIC GAME SUB-COMPONENT --- */
const MusicGame: React.FC = () => {
  const pianoKeys = [
    { note: 'DO', animal: 'fox', label: 'Zorrito', color: 'bg-rose-500' },
    { note: 'RE', animal: 'cat', label: 'Gatito', color: 'bg-orange-500' },
    { note: 'MI', animal: 'rabbit', label: 'Conejito', color: 'bg-amber-500' },
    { note: 'FA', animal: 'panda', label: 'Panda', color: 'bg-emerald-500' },
    { note: 'SOL', animal: 'owl', label: 'Búho', color: 'bg-sky-500' },
    { note: 'LA', animal: 'dog', label: 'Perrito', color: 'bg-indigo-500' },
    { note: 'SI', animal: 'lion', label: 'León', color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Música de la Granja Cluky</h3>
        <p className="text-xs text-slate-500 mt-1">Presiona cada tecla para escuchar las notas y los animalitos cantar</p>
      </div>

      <div className="grid grid-cols-7 gap-2 max-w-lg w-full">
        {pianoKeys.map((k) => (
          <button
            key={k.note}
            onClick={() => sounds.playAnimalChime(k.animal)}
            className={`${k.color} text-white rounded-2xl h-44 flex flex-col items-center justify-between py-3 shadow-md hover:scale-105 active:scale-90 transition-all cursor-pointer`}
          >
            <div className="w-8 h-8 rounded-full bg-white/30 p-1">
              <AnimalAvatarIcon animal={k.animal} className="w-full h-full" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-black tracking-wider">{k.note}</span>
              <span className="block text-[10px] font-bold opacity-80">{k.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};