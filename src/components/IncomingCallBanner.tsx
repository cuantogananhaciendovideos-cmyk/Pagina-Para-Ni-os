import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { AnimalAvatar } from '../types';
import { AnimalAvatarIcon } from './AnimalAvatarIcon';
import { sounds } from '../services/soundEffects';

interface IncomingCallBannerProps {
  callerName: string;
  callerAvatar: AnimalAvatar;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallBanner: React.FC<IncomingCallBannerProps> = ({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
}) => {
  const ringtoneTimerRef = useRef<any>(null);

  useEffect(() => {
    // Play gentle kid ringtone repeatedly while ringing
    sounds.playRingtone();
    ringtoneTimerRef.current = setInterval(() => {
      sounds.playRingtone();
    }, 2200);

    return () => {
      if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    };
  }, []);

  const handleAcceptClick = () => {
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    sounds.playCallConnected();
    onAccept();
  };

  const handleDeclineClick = () => {
    if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    sounds.playCallEnd();
    onDecline();
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99990] w-full max-w-md px-4 animate-bounce select-none">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-3xl p-4 shadow-2xl border-4 border-amber-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AnimalAvatarIcon animal={callerAvatar} className="w-12 h-12" />
            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-white">
              {callType === 'video' ? (
                <Video className="w-3 h-3 text-white" />
              ) : (
                <Phone className="w-3 h-3 text-white" />
              )}
            </span>
          </div>

          <div>
            <h4 className="font-black text-sm text-white">¡Llamada de {callerName}!</h4>
            <p className="text-xs text-purple-100 font-semibold">
              {callType === 'video' ? 'Videollamada en vivo 📹' : 'Llamada de voz 📞'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Decline */}
          <button
            type="button"
            onClick={handleDeclineClick}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-md transition active:scale-95 cursor-pointer"
            title="Rechazar llamada"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {/* Accept */}
          <button
            type="button"
            onClick={handleAcceptClick}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer animate-pulse"
            title="Contestar llamada"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Contestar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
