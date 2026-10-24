/**
 * Clayckey Bookly For Kids
 * Subnombre: For Kids
 * Red social y cuaderno vivo seguro para niños desde 5 años
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NavigationSidebar } from './components/NavigationSidebar';
import { RightProfileSidebar } from './components/RightProfileSidebar';
import { FeedView } from './components/FeedView';
import { NotebookProfileView } from './components/NotebookProfileView';
import { ClassroomView } from './components/ClassroomView';
import { FriendsView } from './components/FriendsView';
import { MediaGalleryView } from './components/MediaGalleryView';
import { GamesView } from './components/GamesView';
import { ParentDashboard } from './components/ParentDashboard';
import { TeacherView } from './components/TeacherView';
import { CreatePostModal } from './components/CreatePostModal';
import { SosHelpModal } from './components/SosHelpModal';
import { RedCodeAlertModal } from './components/RedCodeAlertModal';
import { ConversationsView } from './components/ConversationsView';
import { AuthModal } from './components/AuthModal';
import { HandMagicController } from './components/HandMagicController';
import { IncomingCallBanner } from './components/IncomingCallBanner';
import { ActiveCallModal } from './components/ActiveCallModal';
import { PauseCircle, PlayCircle, ShieldAlert, Sparkles, Moon } from 'lucide-react';
import { sounds } from './services/soundEffects';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    role,
    isScreenPaused,
    toggleScreenPause,
    childProfile,
    isDarkMode,
    isAuthModalOpen,
    authModalInitialMode,
    closeAuthModal,
    incomingCall,
    acceptIncomingCall,
    declineIncomingCall,
    activeCallModalData,
    closeActiveCallModal,
  } = useApp();

  return (
    <div className={`min-h-screen transition-colors duration-200 selection:bg-purple-200 selection:text-purple-900 ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F4F7FC] text-slate-800'
    } flex flex-col`}>
      {/* Top Header */}
      <Header />

      {/* Screen Paused by Parents Overlay */}
      {isScreenPaused && (
        <div className="fixed inset-0 z-40 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-6 text-white text-center animate-in fade-in select-none">
          <div className="max-w-md w-full bg-indigo-900/80 rounded-3xl p-8 border-4 border-indigo-400 shadow-2xl">
            <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-300 animate-bounce">
              <Moon className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black mb-2">¡Hora de descansar la vista! 🌟</h2>
            <p className="text-sm text-indigo-200 mb-6 font-medium leading-relaxed">
              Tus papás han puesto una pausa para que estires tus brazos, bebas agua o juegues un ratito con tus juguetes. ¡Volvemos pronto!
            </p>
            <button
              onClick={toggleScreenPause}
              className="px-6 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-xs shadow-lg cursor-pointer hover:bg-indigo-50"
            >
              🔓 Desbloquear con autorización de papá o mamá
            </button>
          </div>
        </div>
      )}

      {/* Account Frozen Alert Banner if parent activated safety freeze */}
      {childProfile.isAccountFrozen && (
        <div className="bg-amber-500 text-slate-900 py-2 px-4 text-center font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
          <ShieldAlert className="w-4 h-4" />
          <span>
            Cuenta de {childProfile.firstName} en modo de protección preventiva por sus padres. (Solo lectura activa).
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Navigation Sidebar */}
        <NavigationSidebar />

        {/* Center Main View */}
        <section id="main-content-section" className="flex-1 w-full min-w-0">
          {activeTab === 'feed' && <FeedView />}
          {activeTab === 'notebook' && <NotebookProfileView />}
          {activeTab === 'messages' && <ConversationsView />}
          {activeTab === 'classroom' && <ClassroomView />}
          {activeTab === 'friends' && <FriendsView />}
          {activeTab === 'photos' && <MediaGalleryView initialFilter="photos" />}
          {activeTab === 'videos' && <MediaGalleryView initialFilter="videos" />}
          {activeTab === 'games' && <GamesView />}
          {activeTab === 'parent-dashboard' && <ParentDashboard />}
          {activeTab === 'teacher-dashboard' && <TeacherView />}
        </section>

        {/* Right Kid Profile & Friends Sidebar (Visible on Inicio matching user mockup) */}
        {role !== 'parent' && activeTab === 'feed' && <RightProfileSidebar />}
      </main>

      {/* Global Modals */}
      <CreatePostModal />
      <SosHelpModal />
      <RedCodeAlertModal />
      <AuthModal isOpen={isAuthModalOpen} initialMode={authModalInitialMode} onClose={closeAuthModal} />

      {/* Real WebRTC Incoming Call Banner (Rings across any tab/screen) */}
      {incomingCall && (
        <IncomingCallBanner
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.type}
          onAccept={acceptIncomingCall}
          onDecline={declineIncomingCall}
        />
      )}

      {/* Real WebRTC Active Voice or Video Call Modal */}
      {activeCallModalData && (
        <ActiveCallModal
          isOpen={activeCallModalData.isOpen}
          callType={activeCallModalData.type}
          friendName={activeCallModalData.friendName}
          friendAvatar={activeCallModalData.friendAvatar}
          childName={childProfile.firstName}
          childAvatar={childProfile.avatar}
          calleeId={activeCallModalData.calleeId}
          callerId={activeCallModalData.callerId}
          callId={activeCallModalData.callId}
          isIncoming={activeCallModalData.isIncoming}
          onClose={closeActiveCallModal}
        />
      )}

      {/* Hand Tracking Magic Wand System */}
      <HandMagicController />

      {/* Minimalistic Kid Safe Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-500 select-none border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-center gap-2 font-semibold">
          <span>Clayckey Bookly For Kids</span>
          <span>•</span>
          <span>El Cuaderno Vivo</span>
          <span>•</span>
          <span className="text-emerald-500 font-bold">100% Protegido</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
