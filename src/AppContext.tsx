import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { Friend, ChildProfile, FriendRequest, AnimalAvatar } from '../types';

interface AppContextType {
  currentUser: User | null;
  childProfile: ChildProfile;
  friends: Friend[];
  myFriendCode: string;
  incomingFriendRequests: FriendRequest[];
  sendFriendRequestByCode: (code: string) => Promise<{ ok: boolean; message: string }>;
  respondToFriendRequest: (requestId: string, accept: boolean) => Promise<void>;
  startConversationWithFriend: (friend: Friend) => void;
  startCallWithFriend: (friendId: string, friendName: string, avatar: AnimalAvatar, type: 'voice' | 'video') => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myFriendCode, setMyFriendCode] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<FriendRequest[]>([]);
  const [childProfile, setChildProfile] = useState<ChildProfile>({
    firstName: 'Amigo',
    avatar: 'panda',
    theme: 'purple',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          
          let code = '';
          if (snap.exists() && snap.data().friendCode) {
            code = snap.data().friendCode;
          } else {
            // Generar un código único basado en el UID si aún no está registrado en Firestore
            code = `CK-${user.uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-10).padStart(10, '0')}`;
            await setDoc(userRef, { friendCode: code }, { merge: true });
          }
          setMyFriendCode(code);
        } catch (error) {
          console.error("Error al cargar o generar el código de amigo:", error);
          // Respaldo local en caso de un fallo puntual de red
          const fallbackCode = `CK-${user.uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-10).padStart(10, '0')}`;
          setMyFriendCode(fallbackCode);
        }
      } else {
        setMyFriendCode('');
        setFriends([]);
        setIncomingFriendRequests([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendFriendRequestByCode = async (code: string) => {
    if (!currentUser) return { ok: false, message: 'Inicia sesión para enviar solicitudes.' };
    // Lógica para enviar solicitud por código
    return { ok: true, message: '¡Solicitud enviada con éxito!' };
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    // Lógica para aceptar o rechazar solicitudes
  };

  const startConversationWithFriend = (friend: Friend) => {
    console.log("Iniciar conversación con", friend.firstName);
  };

  const startCallWithFriend = (friendId: string, friendName: string, avatar: AnimalAvatar, type: 'voice' | 'video') => {
    console.log(`Iniciando llamada ${type} con ${friendName}`);
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    console.log("Abrir modal de autenticación:", mode);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        childProfile,
        friends,
        myFriendCode,
        incomingFriendRequests,
        sendFriendRequestByCode,
        respondToFriendRequest,
        startConversationWithFriend,
        startCallWithFriend,
        openAuthModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
