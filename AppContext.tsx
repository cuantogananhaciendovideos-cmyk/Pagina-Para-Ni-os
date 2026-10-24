import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AnimalAvatar,
  BlacklistEntry,
  ChatMessage,
  ChatMessageType,
  ChildProfile,
  ClassTask,
  Comment,
  Conversation,
  Friend,
  NotebookTheme,
  Post,
  RedCodeAlert,
  RedCodeResult,
  Role,
} from '../types';
import {
  INITIAL_BLACKLIST,
  INITIAL_CHILD_PROFILE,
  INITIAL_COMMENTS,
  INITIAL_POSTS,
  INITIAL_RED_ALERTS,
  INITIAL_TASKS,
} from '../services/mockData';
import { evaluateRedCode } from '../services/safetyFilter';
import { sounds } from '../services/soundEffects';
import {
  auth,
  db,
  signInWithGoogle,
  registerWithEmail,
  logInWithEmail,
  logOut,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType,
  User,
} from '../services/firebase';
import {
  webrtcService,
  WebRTCService,
  WebRTCCallData,
  CallType,
} from '../services/webrtcService';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  childProfile: ChildProfile;
  updateChildTheme: (theme: NotebookTheme) => void;
  updateChildAvatar: (avatar: AnimalAvatar) => void;
  posts: Post[];
  comments: Comment[];
  tasks: ClassTask[];
  friends: Friend[];
  redAlerts: RedCodeAlert[];
  blacklist: BlacklistEntry[];
  isScreenPaused: boolean;
  toggleScreenPause: () => void;
  strictApprovalMode: boolean;
  setStrictApprovalMode: (enabled: boolean) => void;
  isHandModeActive: boolean;
  toggleHandMode: () => void;
  setHandModeActive: (active: boolean) => void;
  currentUser: User | null;
  isAuthModalOpen: boolean;
  authModalInitialMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<{ user: User | null; error: string | null }>;
  signupWithEmailPassword: (
    email: string,
    pass: string,
    name: string,
    role: Role,
    avatar: AnimalAvatar
  ) => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<void>;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  messages: ChatMessage[];
  sendMessage: (
    convId: string,
    text: string,
    mediaUrl?: string,
    mediaType?: ChatMessageType,
    mediaDuration?: number,
    fileSizeKb?: number
  ) => RedCodeResult;
  startConversationWithFriend: (friend: Friend) => void;
  incomingCall: WebRTCCallData | null;
  activeCallModalData: {
    isOpen: boolean;
    type: CallType;
    friendName: string;
    friendAvatar: AnimalAvatar;
    calleeId?: string;
    callerId?: string;
    callId?: string;
    isIncoming?: boolean;
  } | null;
  startCallWithFriend: (
    friendId: string,
    friendName: string,
    friendAvatar: AnimalAvatar,
    type: CallType
  ) => void;
  acceptIncomingCall: () => void;
  declineIncomingCall: () => void;
  closeActiveCallModal: (durationSec: number, type: CallType) => void;
  isSosModalOpen: boolean;
  setIsSosModalOpen: (open: boolean) => void;
  createPostType: 'photo' | 'video' | 'gif' | 'text' | null;
  openCreatePostModal: (type: 'photo' | 'video' | 'gif' | 'text') => void;
  closeCreatePostModal: () => void;
  activeEmergencyAlert: RedCodeAlert | null;
  dismissEmergencyAlert: () => void;
  publishPost: (postData: {
    type: 'photo' | 'video' | 'gif' | 'text';
    content: string;
    mediaUrl?: string;
  }) => RedCodeResult;
  submitComment: (postId: string, text: string) => RedCodeResult;
  toggleLikePost: (postId: string) => void;
  submitTask: (taskId: string, mediaUrl?: string) => void;
  triggerChildSos: () => void;
  testRedCodeSim: (text: string) => RedCodeResult;
  handleBlockFromAlert: (alertId: string) => void;
  handleFreezeChildAccount: () => void;
  unfreezeChildAccount: () => void;
  approveFriend: (friendId: string) => void;
  addFriendRequest: (name: string, avatar: AnimalAvatar) => void;
  sendFriendRequestByCode: (code: string) => Promise<{ ok: boolean; message: string }>;
  respondToFriendRequest: (requestId: string, accept: boolean) => Promise<void>;
  incomingFriendRequests: Array<{ id: string; fromName: string; fromAvatar: AnimalAvatar; fromUid: string }>;
  myFriendCode: string;
  createChildProfile: (name: string, avatar: AnimalAvatar, theme: NotebookTheme, grade: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('child');
  const [activeTab, setActiveTabState] = useState<string>('feed');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myFriendCode, setMyFriendCode] = useState('');
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<Array<{ id: string; fromName: string; fromAvatar: AnimalAvatar; fromUid: string }>>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('cluky_dark_mode') === 'true';
  });

  const [childProfile, setChildProfile] = useState<ChildProfile>(() => {
    try {
      const saved = localStorage.getItem('cluky_child_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CHILD_PROFILE,
          ...parsed,
          firstName: parsed.firstName || INITIAL_CHILD_PROFILE.firstName,
          avatar: parsed.avatar || INITIAL_CHILD_PROFILE.avatar,
          theme: parsed.theme || INITIAL_CHILD_PROFILE.theme,
          themeName: parsed.themeName || INITIAL_CHILD_PROFILE.themeName,
        };
      }
    } catch {
    }
    return INITIAL_CHILD_PROFILE;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('cluky_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('cluky_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [tasks, setTasks] = useState<ClassTask[]>(() => {
    const saved = localStorage.getItem('cluky_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [friends, setFriends] = useState<Friend[]>([]);

  const [redAlerts, setRedAlerts] = useState<RedCodeAlert[]>(() => {
    const saved = localStorage.getItem('cluky_alerts');
    return saved ? JSON.parse(saved) : INITIAL_RED_ALERTS;
  });

  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(() => {
    const saved = localStorage.getItem('cluky_blacklist');
    return saved ? JSON.parse(saved) : INITIAL_BLACKLIST;
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isScreenPaused, setIsScreenPaused] = useState<boolean>(false);
  const [strictApprovalMode, setStrictApprovalMode] = useState<boolean>(true);
  const [isHandModeActive, setIsHandModeActive] = useState<boolean>(false);

  const toggleHandMode = () => {
    setIsHandModeActive((prev) => !prev);
  };

  const setHandModeActive = (active: boolean) => {
    setIsHandModeActive(active);
  };

  const [incomingCall, setIncomingCall] = useState<WebRTCCallData | null>(null);
  const [activeCallModalData, setActiveCallModalData] = useState<{
    isOpen: boolean;
    type: CallType;
    friendName: string;
    friendAvatar: AnimalAvatar;
    calleeId?: string;
    callerId?: string;
    callId?: string;
    isIncoming?: boolean;
  } | null>(null);

  useEffect(() => {
    const targetUserId = currentUser ? currentUser.uid : childProfile.id;
    const unsub = WebRTCService.listenForIncomingCalls(targetUserId, (callData) => {
      setIncomingCall(callData);
    });
    return () => unsub();
  }, [currentUser, childProfile.id]);

  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [createPostType, setCreatePostType] = useState<'photo' | 'video' | 'gif' | 'text' | null>(null);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<RedCodeAlert | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (user.displayName && childProfile.firstName === 'Luna') {
          const firstWord = user.displayName.split(' ')[0];
          setChildProfile((prev) => ({
            ...prev,
            firstName: firstWord,
          }));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setMyFriendCode('');
      setIncomingFriendRequests([]);
      return;
    }
    let active = true;
    const userRef = doc(db, 'users', currentUser.uid);
    getDoc(userRef).then(async (snap) => {
      if (!active) return;
      const existingCode = snap.exists() ? snap.data().friendCode : undefined;
      const code = typeof existingCode === 'string' && existingCode ? existingCode : `CK-${currentUser.uid.slice(-10).toUpperCase()}`;
      setMyFriendCode(code);
      if (!existingCode) {
        await setDoc(userRef, {
          userId: currentUser.uid,
          email: currentUser.email || '',
          role,
          firstName: childProfile.firstName,
          avatar: childProfile.avatar,
          theme: childProfile.theme,
          friendCode: code,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    }).catch((err) => console.error('No se pudo cargar el perfil de usuario:', err));

    const requestsQuery = query(collection(db, 'friendRequests'), where('toUid', '==', currentUser.uid), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      setIncomingFriendRequests(snapshot.docs.map((d) => {
        const data = d.data();
        return { id: d.id, fromName: String(data.fromName || 'Amigo'), fromAvatar: (data.fromAvatar || 'panda') as AnimalAvatar, fromUid: String(data.fromUid || '') };
      }));
    }, (err) => console.error('No se pudieron cargar solicitudes de amistad:', err));

    return () => { active = false; unsubscribe(); };
  }, [currentUser, role, childProfile.firstName, childProfile.avatar, childProfile.theme]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const refreshAcceptedFriends = async () => {
      try {
        const [sent, received] = await Promise.all([
          getDocs(query(collection(db, 'friendRequests'), where('fromUid', '==', currentUser.uid), where('status', '==', 'accepted'))),
          getDocs(query(collection(db, 'friendRequests'), where('toUid', '==', currentUser.uid), where('status', '==', 'accepted')))
        ]);

        const friendIds = new Set<string>();
        sent.docs.forEach(doc => friendIds.add(doc.data().toUid));
        received.docs.forEach(doc => friendIds.add(doc.data().fromUid));

        const friendsData: Friend[] = [];
        for (const uid of friendIds) {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            friendsData.push({
              id: uid,
              firstName: data.firstName || 'Amigo',
              avatar: data.avatar || 'panda',
              relation: 'Amigo',
              isImaginary: false
            });
          }
        }
        if (active) setFriends(friendsData);
      } catch (err) {
        console.error('Error cargando amigos:', err);
      }
    };

    refreshAcceptedFriends();
    const unsubFriends = onSnapshot(query(collection(db, 'friendRequests'), where('status', '==', 'accepted')), () => {
      refreshAcceptedFriends();
    });

    return () => { active = false; unsubFriends(); };
  }, [currentUser]);
  
  const setRole = (newRole: Role) => setRoleState(newRole);
  const setActiveTab = (tab: string) => setActiveTabState(tab);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const updateChildTheme = (theme: NotebookTheme) => setChildProfile(prev => ({ ...prev, theme }));
  const updateChildAvatar = (avatar: AnimalAvatar) => setChildProfile(prev => ({ ...prev, avatar }));
  const toggleScreenPause = () => setIsScreenPaused(prev => !prev);
  const setStrictApprovalMode = (val: boolean) => setStrictApprovalMode(val);
  const openAuthModal = (mode: 'login' | 'signup' = 'login') => { setAuthModalInitialMode(mode); setIsAuthModalOpen(true); };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const loginWithGoogle = async () => await signInWithGoogle();
  const loginWithEmailPassword = async (e: string, p: string) => await logInWithEmail(e, p);
  const signupWithEmailPassword = async (e: string, p: string, n: string, r: Role, a: AnimalAvatar) => await registerWithEmail(e, p, n, r, a);
  const logout = async () => await logOut();
  const setActiveConversationId = (id: string) => setActiveConversationId(id);
  const sendMessage = (convId: string, text: string, mediaUrl?: string, mediaType?: ChatMessageType) => ({ ok: true, message: "Enviado", alertTriggered: false });
  const startConversationWithFriend = (f: Friend) => {};
  const startCallWithFriend = (fid: string, nm: string, av: AnimalAvatar, type: CallType) => {};
  const acceptIncomingCall = () => {};
  const declineIncomingCall = () => {};
  const closeActiveCallModal = (s: number, t: CallType) => {};
  const setIsSosModalOpen = (o: boolean) => setIsSosModalOpen(o);
  const openCreatePostModal = (t: 'photo' | 'video' | 'gif' | 'text') => setCreatePostType(t);
  const closeCreatePostModal = () => setCreatePostType(null);
  const dismissEmergencyAlert = () => setActiveEmergencyAlert(null);
  const publishPost = (pd: { type: 'photo' | 'video' | 'gif' | 'text'; content: string; mediaUrl?: string }) => ({ ok: true, message: "Publicado", alertTriggered: false });
  const submitComment = (pd: string, text: string) => ({ ok: true, message: "Comentado", alertTriggered: false });
  const toggleLikePost = (pid: string) => {};
  const submitTask = (tid: string, url?: string) => {};
  const triggerChildSos = () => {};
  const testRedCodeSim = (text: string) => ({ ok: true, message: "", alertTriggered: false });
  const handleBlockFromAlert = (aid: string) => {};
  const handleFreezeChildAccount = () => {};
  const unfreezeChildAccount = () => {};
  const approveFriend = (fid: string) => {};
  const addFriendRequest = (name: string, avatar: AnimalAvatar) => {};
  const sendFriendRequestByCode = async (code: string) => ({ ok: true, message: "Solicitud enviada" });
  const respondToFriendRequest = async (rid: string, a: boolean) => {};
  const createChildProfile = (name: string, avatar: AnimalAvatar, theme: NotebookTheme, grade: string) => {};

  return (
    <AppContext.Provider value={{
      role, setRole, activeTab, setActiveTab, isDarkMode, toggleDarkMode,
      childProfile, updateChildTheme, updateChildAvatar, posts, comments, tasks,
      friends, redAlerts, blacklist, isScreenPaused, toggleScreenPause,
      strictApprovalMode, setStrictApprovalMode, isHandModeActive, toggleHandMode,
      setHandModeActive, currentUser, isAuthModalOpen, authModalInitialMode,
      openAuthModal, closeAuthModal, loginWithGoogle, loginWithEmailPassword,
      signupWithEmailPassword, logout, conversations, activeConversationId,
      setActiveConversationId, messages, sendMessage, startConversationWithFriend,
      incomingCall, activeCallModalData, startCallWithFriend, acceptIncomingCall,
      declineIncomingCall, closeActiveCallModal, isSosModalOpen, setIsSosModalOpen,
      createPostType, openCreatePostModal, closeCreatePostModal, activeEmergencyAlert,
      dismissEmergencyAlert, publishPost, submitComment, toggleLikePost, submitTask,
      triggerChildSos, testRedCodeSim, handleBlockFromAlert, handleFreezeChildAccount,
      unfreezeChildAccount, approveFriend, addFriendRequest, sendFriendRequestByCode,
      respondToFriendRequest, incomingFriendRequests, myFriendCode, createChildProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
