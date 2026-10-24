import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  FileText,
  Lock,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Search,
  Sparkles,
  Download,
  Flame,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';

export const ParentDashboard: React.FC = () => {
  const {
    childProfile,
    redAlerts,
    blacklist,
    friends,
    isScreenPaused,
    toggleScreenPause,
    strictApprovalMode,
    setStrictApprovalMode,
    handleBlockFromAlert,
    handleFreezeChildAccount,
    unfreezeChildAccount,
    testRedCodeSim,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'simulator' | 'time' | 'approvals' | 'blacklist'>('alerts');
  const [parentName, setParentName] = useState<'Papá Carlos' | 'Mamá Mariana'>('Papá Carlos');
  const [showParentTour, setShowParentTour] = useState(true);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<ReturnType<typeof testRedCodeSim> | null>(null);
  const [selectedEvidenceAlert, setSelectedEvidenceAlert] = useState<string | null>(null);

  const handleRunSimTest = () => {
    if (!testInput.trim()) return;
    const res = testRedCodeSim(testInput.trim());
    setTestResult(res);
  };

  const handleDownloadEvidence = (alertId: string) => {
    sounds.playStarCelebration();
    const alert = redAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    const data = {
      plataforma: 'Clayckey Bookly For Kids',
      tipo: 'EVIDENCIA FORENSE DIGITAL - CÓDIGO ROJO',
      fecha_hora_utc: new Date().toISOString(),
      timestamp_local: alert.timestamp,
      menor_protegido: alert.childName,
      perfil_menor_id: alert.childId,
      cuenta_origen_sospechosa: alert.senderAccount,
      nivel_amenaza: alert.level.toUpperCase(),
      categorias_detectadas: alert.categories,
      texto_crudo: alert.detectedText,
      explicacion_tecnica: alert.explanation,
      hash_integridad_sha256: alert.evidenceHash,
      cadena_custodia: 'Registro inmutable preservado para autoridad judicial / fiscalía de menores.',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Evidencia_ClayckeyBookly_${alert.evidenceHash}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full">
      {/* Parent Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden border-4 border-purple-500/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-xs font-black uppercase tracking-wider mb-1.5 text-purple-200">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Centro de Control y Protección Parental</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-2xl sm:text-3xl font-black">
                {parentName}
              </h2>
              <span className="text-[11px] bg-purple-500/40 text-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                Tutor de {childProfile.firstName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
              {childProfile.firstName} ({childProfile.grade}) • Cuaderno Vivo protegido bajo las 6 Reglas Base y Sistema Código Rojo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-center">
            {/* Toggle example parent */}
            <button
              onClick={() => {
                sounds.playPop();
                setParentName(parentName === 'Papá Carlos' ? 'Mamá Mariana' : 'Papá Carlos');
              }}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer border border-white/20"
              title="Alternar entre papá o mamá de ejemplo"
            >
              🔄 Cambiar a {parentName === 'Papá Carlos' ? 'Mamá Mariana' : 'Papá Carlos'}
            </button>

            {childProfile.isAccountFrozen ? (
              <button
                onClick={unfreezeChildAccount}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <Lock className="w-4 h-4" />
                <span>Descongelar Cuenta</span>
              </button>
            ) : (
              <button
                onClick={handleFreezeChildAccount}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Congelar por Seguridad</span>
              </button>
            )}

            <button
              onClick={toggleScreenPause}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 ${
                isScreenPaused
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isScreenPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" /> Reanudar Pantalla
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" /> Pausar Pantalla Ahora
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* GUIA DE EJEMPLO PARA NUEVOS USUARIOS / PADRES */}
      {showParentTour && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-pink-950/40 rounded-3xl p-5 border border-purple-200/80 dark:border-purple-800 shadow-xs">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="text-sm font-black text-purple-900 dark:text-purple-200">
                Guía de Ejemplo: ¿Cómo protege {parentName} a {childProfile.firstName}?
              </h3>
            </div>
            <button
              onClick={() => setShowParentTour(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕ Ocultar guía
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            En <strong>Clayckey Bookly For Kids</strong>, ningún niño puede ser contactado por desconocidos. Como padre o madre tutor:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200/60 dark:border-purple-800/60">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mb-1">
                1. Alerta Roja Instantánea 🚨
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Si alguien intenta sacar al niño a WhatsApp o pedir secretos, el mensaje NUNCA llega y suena tu alarma.
              </p>
              <button
                onClick={() => testRedCodeSim('Oye sal a WhatsApp 5512345678 que tus papas no se enteren')}
                className="w-full py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black cursor-pointer shadow-xs"
              >
                Probar Alerta Roja de Ejemplo
              </button>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200/60 dark:border-purple-800/60">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block mb-1">
                2. Pausa Suave de Pantalla ⏱️
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Con un solo toque puedes pausar la pantalla para que el niño descanse su vista o haga otra actividad.
              </p>
              <button
                onClick={toggleScreenPause}
                className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black cursor-pointer shadow-xs"
              >
                {isScreenPaused ? 'Reanudar Pantalla' : 'Probar Pausar Pantalla'}
              </button>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200/60 dark:border-purple-800/60">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                3. Aprobación de Amigos 👥
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Luna solo ve a amigos previamente revisados por ti. No hay buscadores públicos de niños.
              </p>
              <button
                onClick={() => setActiveSubTab('approvals')}
                className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black cursor-pointer shadow-xs"
              >
                Ver Círculo de Amigos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={() => { sounds.playPop(); setActiveSubTab('alerts'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'alerts'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Alertas Código Rojo ({redAlerts.length})</span>
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveSubTab('simulator'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'simulator'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Simulador de Pruebas</span>
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveSubTab('time'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'time'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Tiempo de Pantalla</span>
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveSubTab('approvals'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'approvals'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Aprobación y Amigos</span>
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveSubTab('blacklist'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'blacklist'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <UserX className="w-4 h-4 text-rose-500" />
          <span>Lista Negra ({blacklist.length})</span>
        </button>
      </div>

      {/* TAB 1: ALERTAS CÓDIGO ROJO */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-3xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-rose-800 dark:text-rose-200">
                Sistema Código Rojo Activo y Supervisando en Servidor
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                Ningún mensaje peligroso llega al menor. Los intentos de desviar a WhatsApp, pedir fotos privadas, citar a solas o pedir secretos quedan interceptados y congelados de inmediato con evidencia judicial.
              </p>
            </div>
          </div>

          {redAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-3xl border shadow-xs transition-all ${
                alert.status === 'blocked'
                  ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 opacity-90'
                  : 'bg-white/90 dark:bg-slate-800/90 border-rose-300 dark:border-rose-800/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      alert.level === 'red'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : alert.level === 'orange'
                        ? 'bg-orange-500 text-white'
                        : 'bg-amber-400 text-slate-900'
                    }`}
                  >
                    Código {alert.level.toUpperCase()}
                  </span>

                  <span className="text-xs text-slate-400">{alert.timestamp}</span>
                </div>

                <div className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg text-slate-500 dark:text-slate-400">
                  Hash: {alert.evidenceHash}
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {alert.explanation}
                </h4>
                <div className="mt-2 p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs font-mono text-rose-900 dark:text-rose-200">
                  <span className="font-bold text-slate-500 block mb-1">Contenido interceptado antes de llegar a {alert.childName}:</span>
                  "{alert.detectedText}"
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                {alert.status === 'blocked' ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Cuenta expulsada y bloqueada en Lista Negra
                  </span>
                ) : (
                  <button
                    onClick={() => handleBlockFromAlert(alert.id)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>BLOQUEAR AHORA Y LISTA NEGRA</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownloadEvidence(alert.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Evidencia Cifrada</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SIMULADOR DE PRUEBAS INTERACTIVO */}
      {activeSubTab === 'simulator' && (
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Laboratorio de Pruebas de Filtro Código Rojo</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Prueba cualquier texto disfrazado, con espacios, leetspeak o números ocultos para ver cómo el motor de normalización en servidor detecta la amenaza al instante.
            </p>
          </div>

          {/* Quick preset tests for quick demo */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pruebas rápidas:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTestInput('Oye sal a w h a t s a p p 5512345678 que tus papas no se enteren')}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                1. WhatsApp disfrazado + teléfono
              </button>
              <button
                type="button"
                onClick={() => setTestInput('Nos vemos a escondidas en el parque a las 4 ven sola')}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                2. Cita a escondidas a solas
              </button>
              <button
                type="button"
                onClick={() => setTestInput('Mandame una foto tuya sin ropa y te regalo un celular')}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                3. Fotos privadas + soborno
              </button>
              <button
                type="button"
                onClick={() => setTestInput('¡Hola Luna! Me encanta tu dibujo del zorrito con acuarelas')}
                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium cursor-pointer"
              >
                4. Mensaje 100% Seguro
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Escribe aquí una frase para probar el motor de seguridad..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-white focus:outline-hidden focus:border-purple-500"
            />
            <button
              onClick={handleRunSimTest}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md cursor-pointer"
            >
              Evaluar Filtro
            </button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-2xl border animate-in fade-in ${
                testResult.level === 'red'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                  : testResult.level === 'safe'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm uppercase">
                  Resultado: Código {testResult.level.toUpperCase()}
                </span>
                <span className="text-xs font-mono font-bold">
                  Acción: {testResult.actionTaken}
                </span>
              </div>
              <p className="text-xs font-semibold mb-2">{testResult.explanation}</p>
              <div className="text-[11px] font-mono bg-black/10 dark:bg-white/10 p-2 rounded-xl">
                <div>Normalización del servidor: "{testResult.normalizedText}"</div>
                <div>Categorías detectadas: {testResult.categories.join(', ') || 'Ninguna'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIEMPO DE PANTALLA */}
      {activeSubTab === 'time' && (
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Horarios y Límites Diarios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evita el uso excesivo estableciendo límites que pausan automáticamente la aplicación.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-700 dark:text-purple-300 font-bold block">
                Tiempo utilizado hoy por {childProfile.firstName}:
              </span>
              <span className="text-2xl font-black text-purple-900 dark:text-purple-100">
                {childProfile.screenTimeTodayMinutes} minutos / {childProfile.screenTimeLimitMinutes} min permitidos
              </span>
            </div>
            <div className="w-24 bg-purple-200 dark:bg-purple-900 rounded-full h-3 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{ width: `${(childProfile.screenTimeTodayMinutes / childProfile.screenTimeLimitMinutes) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Cambiar límite diario de pantalla:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((min) => (
                <button
                  key={min}
                  onClick={() => sounds.playPop()}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    childProfile.screenTimeLimitMinutes === min
                      ? 'border-purple-500 bg-purple-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {min} minutos
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APROBACIONES */}
      {activeSubTab === 'approvals' && (
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Aprobación Estricta según la Edad
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Todo lo que {childProfile.firstName} o sus amigos quieran publicar requiere tu visto bueno antes de verse.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playPop();
                setStrictApprovalMode(!strictApprovalMode);
              }}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                strictApprovalMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                  strictApprovalMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Amigos Aprobados ({friends.length})
          </h4>
          <div className="space-y-2">
            {friends.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 border">
                    <AnimalAvatarIcon animal={f.avatar} className="w-full h-full" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">
                      {f.firstName}
                    </h5>
                    <p className="text-[11px] text-slate-400">{f.relation} • {f.grade}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                  Aprobado
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LISTA NEGRA */}
      {activeSubTab === 'blacklist' && (
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-rose-500" />
              <span>Lista Negra Permanente</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cuentas expulsadas y vetadas permanentemente por Código Rojo. Sus contenidos han sido eliminados de toda la plataforma.
            </p>
          </div>

          {blacklist.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs text-slate-400">
              No hay cuentas bloqueadas actualmente. La comunidad está segura.
            </div>
          ) : (
            <div className="space-y-3">
              {blacklist.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                        {entry.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{entry.dateBlocked}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {entry.reason}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                      ID Evidencia: {entry.evidenceHash}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-[11px] block text-center">
                      BLOQUEO DEFINITIVO
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
