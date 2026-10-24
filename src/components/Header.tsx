import React, { useState } from 'react';
import {
  ShieldCheck,
  Sun,
  Moon,
  LifeBuoy,
  Users,
  Lock,
  Sparkles,
  GraduationCap,
  BookOpen,
  Home,
  Image as ImageIcon,
  Video,
  Gamepad2,
  ChevronDown,
  MessageCircle,
  LogIn,
  UserPlus,
  LogOut,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    isDarkMode,
    toggleDarkMode,
    triggerChildSos,
    childProfile,
    activeTab,
    setActiveTab,
    currentUser,
    openAuthModal,
    logout,
    isHandModeActive,
    toggleHandMode,
  } = useApp();

  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);

  const topNavTabs = [
    { id: 'feed', label: 'Inicio', icon: Home, color: 'text-blue-500' },
    { id: 'notebook', label: 'Mi Cuaderno', icon: BookOpen, color: 'text-rose-500' },
    { id: 'messages', label: 'Mensajes', icon: MessageCircle, color: 'text-fuchsia-500' },
    { id: 'friends', label: 'Amigos', icon: Users, color: 'text-purple-500' },
    { id: 'classroom', label: 'Mi Clase', icon: GraduationCap, color: 'text-emerald-500' },
    { id: 'photos', label: 'Fotos', icon: ImageIcon, color: 'text-orange-500' },
    { id: 'videos', label: 'Videos', icon: Video, color: 'text-amber-500' },
    { id: 'games', label: 'Juegos', icon: Gamepad2, color: 'text-indigo-500' },
  ];

  const handleParentAccess = () => {
    sounds.playPop();
    // Prompt adult PIN
    setShowPinModal(true);
    setPinInput('');
    setPinError(false);
  };

  const handleVerifyPin = (pin: string) => {
    // 1234 or direct quick enter for parents
    if (pin === '1234' || pin === '') {
      sounds.playStarCelebration();
      setRole('parent');
      setActiveTab('parent-dashboard');
      setShowPinModal(false);
      setShowRoleSelector(false);
    } else {
      sounds.playRedAlarm();
      setPinError(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* LOGO & SUBNOMBRE strictly matching the prompt and mockup */}
        <div 
          onClick={() => { sounds.playPop(); setActiveTab('feed'); }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
          title="Ir al Inicio de Clayckey Bookly For Kids"
        >
          {/* Logo image requested by user */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-pink-100 dark:from-amber-950/60 dark:to-pink-950/60 shadow-md ring-2 ring-indigo-400/40 dark:ring-indigo-500/40 flex items-center justify-center transition-transform group-hover:scale-105">
            <img 
              src="https://i.ibb.co/4R7SnLWD/Bebe-Arletita.png" 
              alt="Clayckey Bookly Logo" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600 dark:from-indigo-400 dark:via-pink-400 dark:to-purple-300 bg-clip-text text-transparent leading-none">
              Clayckey Bookly
            </h1>
            <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-indigo-500/90 dark:text-indigo-400 tracking-wide mt-0.5">
              For Kids
            </span>
          </div>
        </div>

        {/* FACEBOOK-STYLE CENTER TOP NAVIGATION BAR (Visible on md, lg, xl screens) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {topNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs scale-102 ring-2 ring-indigo-400/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : tab.color}`} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* "Protegido" Badge - exactly as in mockup */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Protegido</span>
          </div>

          {/* Giant SOS / Ayuda Button for Child - Mandatory base rule #5 */}
          <button
            onClick={triggerChildSos}
            aria-label="Pedir ayuda a papá y mamá"
            className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-rose-400/40 active:scale-95 transition-all cursor-pointer animate-soft-pulse"
          >
            <LifeBuoy className="w-4 h-4 text-white" />
            <span className="hidden xs:inline">¡Ayuda!</span>
            <span className="xs:hidden">SOS</span>
          </button>

          {/* Magic Wand / Hand Tracking Toggle Button */}
          <button
            onClick={toggleHandMode}
            title={
              isHandModeActive
                ? 'Varita Mágica con Mano ACTIVADA. Haz clic para apagar y volver al mouse normal.'
                : 'Activar Modo Mágico con Mano y Cámara (Controla la pantalla apuntando con tu dedo índice o haciendo pinza 🤏)'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95 ${
              isHandModeActive
                ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white shadow-purple-400/40 ring-2 ring-amber-300 animate-pulse'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-slate-700'
            }`}
          >
            <span className="text-sm">🪄</span>
            <span className="hidden xs:inline">Varita Mágica</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                isHandModeActive ? 'bg-black/30 text-white' : 'bg-indigo-200/60 text-indigo-800 dark:bg-slate-700 dark:text-indigo-300'
              }`}
            >
              {isHandModeActive ? 'ACTIVO' : 'MANO'}
            </span>
          </button>

          {/* Big Sun/Moon Light/Dark Switcher - exactly as in mockup */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Cambiar a modo Día' : 'Cambiar a modo Noche'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-300 text-amber-300 transition-transform duration-300 rotate-12" />
            ) : (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-500 transition-transform duration-300 hover:rotate-45" />
            )}
          </button>

          {/* Friendly Neon Sky-Blue Dropdown Button (Login & Signup) */}
          <div className="relative">
            {!currentUser ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setShowAuthDropdown((prev) => !prev);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all shadow-md hover:shadow-sky-400/50 active:scale-95 cursor-pointer bg-sky-400 hover:bg-sky-300 text-slate-900 border border-sky-200 shadow-sky-400/30"
                title="Opciones de Acceso"
              >
                <User className="w-3.5 h-3.5 fill-current opacity-80" />
                <span className="hidden sm:inline">Acceso</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAuthDropdown ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setShowAuthDropdown((prev) => !prev);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer bg-sky-100 hover:bg-sky-200 text-sky-900 dark:bg-sky-950/70 dark:hover:bg-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-600"
                title={currentUser.email || 'Mi Cuenta'}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="max-w-[80px] sm:max-w-[110px] truncate">
                  {currentUser.displayName ? currentUser.displayName.split(' ')[0] : currentUser.email?.split('@')[0] || 'Mi Cuenta'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAuthDropdown ? 'rotate-180' : ''}`} />
              </button>
            )}

            {/* Dropdown Menu */}
            {showAuthDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAuthDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-sky-300 dark:border-sky-500/50 p-1.5 z-50 animate-in fade-in zoom-in-95">
                  {!currentUser ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setShowAuthDropdown(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-800 dark:text-slate-100 font-black text-xs flex items-center justify-between transition cursor-pointer group"
                      >
                        <span>Login</span>
                        <LogIn className="w-4 h-4 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setShowAuthDropdown(false);
                          openAuthModal('signup');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-800 dark:text-slate-100 font-black text-xs flex items-center justify-between transition cursor-pointer group mt-0.5"
                      >
                        <span>Signup</span>
                        <UserPlus className="w-4 h-4 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-2.5 py-1 border-b border-slate-100 dark:border-slate-700 mb-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Conectado</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{currentUser.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setShowAuthDropdown(false);
                          setActiveTab('notebook');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                      >
                        <span>Mi Cuaderno</span>
                        <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          sounds.playPop();
                          setShowAuthDropdown(false);
                          await logout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-between transition cursor-pointer mt-0.5"
                      >
                        <span>Cerrar Sesión</span>
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Profile Chip + 1-Click to Open Mi Cuaderno & Dropdown for Role Switching */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl p-0.5 border border-slate-200 dark:border-slate-700 transition-all">
            {/* Direct 1-Click Button to open Child's Notebook Profile */}
            <button
              onClick={() => {
                if (role === 'child') {
                  sounds.playPop();
                  setActiveTab('notebook');
                } else if (role === 'parent') {
                  setActiveTab('parent-dashboard');
                } else {
                  setActiveTab('classroom');
                }
              }}
              title="Abrir Mi Cuaderno"
              className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-xl cursor-pointer transition-all ${
                activeTab === 'notebook'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {role === 'child' ? (
                <>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-pink-100 flex items-center justify-center">
                    <AnimalAvatarIcon animal={childProfile?.avatar || 'fox'} hasBow className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-black truncate max-w-[80px] sm:max-w-none">
                    {childProfile?.firstName || 'Luna'}
                  </span>
                </>
              ) : role === 'parent' ? (
                <>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-xs">
                    👨‍👩‍👧
                  </div>
                  <span className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300">
                    Papá/Mamá
                  </span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300">
                    Maestra
                  </span>
                </>
              )}
            </button>

            {/* Dropdown trigger button to change profile/role */}
            <button
              onClick={() => {
                sounds.playPop();
                setShowRoleSelector(!showRoleSelector);
              }}
              title="Cambiar perfil o modo adulto"
              className="px-1.5 py-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRoleSelector ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-3xl p-2.5 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3 py-1.5 tracking-wider">
                  Cambiar de Perfil
                </p>

                {/* Child Option */}
                <button
                  onClick={() => {
                    sounds.playPop();
                    setRole('child');
                    setActiveTab('notebook');
                    setShowRoleSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-colors cursor-pointer ${
                    role === 'child'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                    <AnimalAvatarIcon animal={childProfile.avatar} hasBow className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{childProfile.firstName} (Niña)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Modo Cuaderno Seguro</div>
                  </div>
                </button>

                {/* Parent Option - Locked */}
                <button
                  onClick={handleParentAccess}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-colors cursor-pointer mt-1 ${
                    role === 'parent'
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold flex items-center justify-between">
                      <span>Papá/Mamá/Tutor</span>
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md">PIN</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Control parental y Código Rojo</div>
                  </div>
                </button>

                {/* Teacher Option */}
                <button
                  onClick={() => {
                    sounds.playPop();
                    setRole('teacher');
                    setActiveTab('classroom');
                    setShowRoleSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-colors cursor-pointer mt-1 ${
                    role === 'teacher'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Maestra Elena</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">1° Primaria • Tareas y Avisos</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adult PIN verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-600 dark:text-purple-300">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Área de Padres</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Ingresa el PIN de seguridad del adulto para acceder a la supervisión y Código Rojo.
              <span className="block mt-1 font-semibold text-purple-600 dark:text-purple-400">(PIN por defecto: 1234)</span>
            </p>

            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
              placeholder="PIN de 4 dígitos"
              autoFocus
              className="w-full text-center text-2xl tracking-widest font-mono py-2.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:outline-hidden dark:bg-slate-900 dark:text-white mb-2"
            />

            {pinError && (
              <p className="text-xs font-bold text-rose-500 mb-3">PIN incorrecto. Prueba con 1234.</p>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleVerifyPin(pinInput)}
                className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                Ingresar
              </button>
            </div>

            <button
              onClick={() => handleVerifyPin('1234')}
              className="mt-3 text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              👉 Acceso rápido de demostración (PIN 1234)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
