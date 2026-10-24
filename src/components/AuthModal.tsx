import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { AnimalAvatar, Role } from '../types';
import { sounds } from '../services/soundEffects';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
}

const AVATAR_OPTIONS: { id: AnimalAvatar; name: string }[] = [
  { id: 'fox', name: 'Zorrito' },
  { id: 'cat', name: 'Gatito' },
  { id: 'panda', name: 'Pandita' },
  { id: 'rabbit', name: 'Conejito' },
  { id: 'owl', name: 'Búho Sabio' },
  { id: 'lion', name: 'Leoncito' },
  { id: 'dog', name: 'Perrito' },
  { id: 'koala', name: 'Koala' },
  { id: 'penguin', name: 'Pingüino' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose }) => {
  const {
    currentUser,
    loginWithGoogle,
    loginWithEmailPassword,
    signupWithEmailPassword,
    logout,
    childProfile,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('child');
  const [selectedAvatar, setSelectedAvatar] = useState<AnimalAvatar>('fox');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    sounds.playPop();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      sounds.playStarCelebration();
      setSuccessMsg('¡Bienvenido a Clayckey Bookly! Sesión iniciada con éxito 🌟');
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!email || !password || !name) {
        setErrorMsg('Por favor completa todos los campos requeridos.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        setIsLoading(false);
        return;
      }
      const res = await signupWithEmailPassword(email, password, name, selectedRole, selectedAvatar);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        sounds.playStarCelebration();
        setSuccessMsg('¡Cuenta creada y guardada en Firebase exitosamente! 🎉');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Ingresa tu correo y contraseña.');
        setIsLoading(false);
        return;
      }
      const res = await loginWithEmailPassword(email, password);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        sounds.playStarCelebration();
        setSuccessMsg('¡Hola de nuevo! Sesión iniciada correctamente 🚀');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-4 border-amber-300 dark:border-amber-500 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 p-5 text-white text-center relative">
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl overflow-hidden shadow-inner ring-2 ring-white/60 bg-white/20">
            <img
              src="https://i.ibb.co/4R7SnLWD/Bebe-Arletita.png"
              alt="Clayckey Bookly Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-black tracking-wide">
            {currentUser ? 'Tu Cuenta Familiar' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Segura'}
          </h2>
          <p className="text-xs font-medium text-white/90 mt-1">
            {currentUser
              ? 'Conectado a Firebase en la nube'
              : 'Conexión segura infantil y supervisión parental'}
          </p>
        </div>

        {/* Content body */}
        <div className="p-6">
          {currentUser ? (
            /* Logged in state */
            <div className="text-center space-y-4">
              <div className="inline-block p-1 bg-amber-200 dark:bg-amber-600 rounded-full">
                <AnimalAvatarIcon animal={childProfile.avatar} className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  {childProfile.firstName || currentUser.displayName || 'Usuario'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                  ✅ Autenticado con Firebase
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl text-left text-xs space-y-2 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Beneficios activos:
                </p>
                <p>• Publicaciones y fotos se guardan en la base de datos de Firebase.</p>
                <p>• Tus conversaciones con amigos sincronizadas en tiempo real.</p>
                <p>• Supervisión activa con el filtro Código Rojo.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    sounds.playPop();
                    logout();
                    setSuccessMsg('Has cerrado sesión correctamente.');
                  }}
                  className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 font-bold rounded-2xl transition"
                >
                  Cerrar Sesión
                </button>
                <button
                  onClick={() => {
                    sounds.playPop();
                    onClose();
                  }}
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-md transition"
                >
                  Listo
                </button>
              </div>
            </div>
          ) : (
            /* Log in / Sign up form */
            <div>
              {/* Tab Selector: Login vs Signup */}
              <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-sm font-black rounded-xl transition ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-sm font-black rounded-xl transition ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {/* 1-Click Google Sign In */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-650 rounded-2xl font-bold text-slate-700 dark:text-white shadow-sm transition active:scale-98 mb-4 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continuar con Google
              </button>

              <div className="relative my-4 text-center">
                <hr className="border-slate-200 dark:border-slate-700" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-3 text-xs text-slate-400 font-medium">
                  o con correo
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Nombre de niño o papá/mamá:
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej: Luna, Papá Carlos..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                        ¿Quién eres?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRole('child')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            selectedRole === 'child'
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Niño / Niña
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole('parent')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            selectedRole === 'parent'
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Papá / Mamá
                        </button>
                      </div>
                    </div>

                    {selectedRole === 'child' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Elige tu animalito guardián:
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                          {AVATAR_OPTIONS.map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                setSelectedAvatar(av.id);
                              }}
                              className={`p-1.5 rounded-xl border-2 transition shrink-0 ${
                                selectedAvatar === av.id
                                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 scale-105'
                                  : 'border-transparent hover:border-slate-200 opacity-70'
                              }`}
                              title={av.name}
                            >
                              <AnimalAvatarIcon animal={av.id} className="w-8 h-8" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Correo electrónico:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 hover:from-amber-500 hover:to-purple-600 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-98 disabled:opacity-50 mt-2"
                >
                  {isLoading
                    ? 'Procesando en Firebase...'
                    : mode === 'signup'
                    ? 'Crear Cuenta y Guardar en la Nube 🌟'
                    : 'Iniciar Sesión 🚀'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
