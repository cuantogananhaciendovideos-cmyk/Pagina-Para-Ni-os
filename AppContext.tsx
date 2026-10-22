import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AnimalAvatar,
  BlacklistEntry,
  ChatMessage,
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
  INITIAL_CONVERSATIONS,
  INITIAL_FRIENDS,
  INITIAL_MESSAGES,
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
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
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

  // Firebase Auth State & Actions
  currentUser: User | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
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

  // Conversations & Real-time Messages
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  messages: ChatMessage[];
  sendMessage: (convId: string, text: string, mediaUrl?: string) => RedCodeResult;
  startConversationWithFriend: (friend: Friend) => void;

  // Modals
  isSosModalOpen: boolean;
  setIsSosModalOpen: (open: boolean) => void;
  createPostType: 'photo' | 'video' | 'gif' | 'text' | null;
  openCreatePostModal: (type: 'photo' | 'video' | 'gif' | 'text') => void;
  closeCreatePostModal: () => void;
  activeEmergencyAlert: RedCodeAlert | null;
  dismissEmergencyAlert: () => void;

  // Actions
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
  approvePost: (postId: string) => void;
  rejectPost: (postId: string) => void;
  addFriendRequest: (name: string, avatar: AnimalAvatar) => void;
  createChildProfile: (name: string, avatar: AnimalAvatar, theme: NotebookTheme, grade: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role
  const [role, setRoleState] = useState<Role>('child');
  const [activeTab, setActiveTabState] = useState<string>('feed');

  // Firebase Auth user
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('cluky_dark_mode') === 'true';
  });

  // Profile with safe merge fallback
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
      // Fallback to default
    }
    return INITIAL_CHILD_PROFILE;
  });

  // Data collections
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

  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('cluky_friends');
    return saved ? JSON.parse(saved) : INITIAL_FRIENDS;
  });

  const [redAlerts, setRedAlerts] = useState<RedCodeAlert[]>(() => {
    const saved = localStorage.getItem('cluky_alerts');
    return saved ? JSON.parse(saved) : INITIAL_RED_ALERTS;
  });

  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(() => {
    const saved = localStorage.getItem('cluky_blacklist');
    return saved ? JSON.parse(saved) : INITIAL_BLACKLIST;
  });

  // Conversations & Real-time Messages
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('cluky_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string>('conv-mateo');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('cluky_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Parental flags
  const [isScreenPaused, setIsScreenPaused] = useState<boolean>(false);
  const [strictApprovalMode, setStrictApprovalMode] = useState<boolean>(true);

  // Modals
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [createPostType, setCreatePostType] = useState<'photo' | 'video' | 'gif' | 'text' | null>(null);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<RedCodeAlert | null>(null);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // If user has displayName, adapt profile name smoothly
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

  // 2. Real-time Firestore sync for posts
  useEffect(() => {
    try {
      const postsCol = collection(db, 'posts');
      const q = query(postsCol, limit(50));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestorePosts: Post[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Post;
              firestorePosts.push({
                ...data,
                id: docSnap.id,
              });
            });

            // Merge firestore posts with initial posts cleanly (deduplicating by id)
            setPosts((current) => {
              const combined = [...firestorePosts];
              current.forEach((cp) => {
                if (!combined.some((fp) => fp.id === cp.id)) {
                  combined.push(cp);
                }
              });
              return combined;
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'posts');
        }
      );
      return () => unsubscribe();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'posts');
    }
  }, []);

  // Sync to localStorage and DOM
  useEffect(() => {
    localStorage.setItem('cluky_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('cluky_child_profile', JSON.stringify(childProfile));
  }, [childProfile]);

  useEffect(() => {
    localStorage.setItem('cluky_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('cluky_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('cluky_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cluky_friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('cluky_alerts', JSON.stringify(redAlerts));
  }, [redAlerts]);

  useEffect(() => {
    localStorage.setItem('cluky_blacklist', JSON.stringify(blacklist));
  }, [blacklist]);

  useEffect(() => {
    localStorage.setItem('cluky_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('cluky_messages', JSON.stringify(messages));
  }, [messages]);

  // Tab & role setters with pop audio
  const setActiveTab = (tab: string) => {
    sounds.playPop();
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet) {
        setTimeout(() => {
          const contentEl = document.getElementById('main-content-section');
          if (contentEl) {
            contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const setRole = (newRole: Role) => {
    sounds.playPop();
    setRoleState(newRole);
  };

  const toggleDarkMode = () => {
    sounds.playPop();
    setIsDarkMode((prev) => !prev);
  };

  const updateChildTheme = (newTheme: NotebookTheme) => {
    sounds.playPop();
    const themeNames: Record<NotebookTheme, string> = {
      'pink-purple': 'Rosa & Violeta',
      'sky-blue': 'Azul Cielo & Océano',
      'mint-green': 'Verde Menta & Selva',
      'sun-yellow': 'Amarillo Sol & Miel',
      'magic-purple': 'Morado Mágico & Estrellas',
      'cherry-red': 'Rojo Cereza & Corazón',
      'peach-orange': 'Naranja Melocotón & Dulce',
    };
    setChildProfile((prev) => ({
      ...prev,
      theme: newTheme,
      themeName: themeNames[newTheme],
    }));

    // If logged in, update profile in Firestore
    if (currentUser) {
      setDoc(
        doc(db, 'users', currentUser.uid),
        {
          userId: currentUser.uid,
          theme: newTheme,
          role,
          firstName: childProfile.firstName,
          avatar: childProfile.avatar,
        },
        { merge: true }
      ).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`));
    }
  };

  const updateChildAvatar = (newAvatar: AnimalAvatar) => {
    sounds.playPop();
    setChildProfile((prev) => ({
      ...prev,
      avatar: newAvatar,
    }));

    if (currentUser) {
      setDoc(
        doc(db, 'users', currentUser.uid),
        {
          userId: currentUser.uid,
          avatar: newAvatar,
          role,
          firstName: childProfile.firstName,
        },
        { merge: true }
      ).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`));
    }
  };

  // Auth Functions
  const openAuthModal = () => {
    sounds.playPop();
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    sounds.playPop();
    setIsAuthModalOpen(false);
  };

  const loginWithGoogleAction = async () => {
    const res = await signInWithGoogle();
    if (res.user) {
      try {
        const userDocRef = doc(db, 'users', res.user.uid);
        await setDoc(
          userDocRef,
          {
            userId: res.user.uid,
            email: res.user.email || '',
            role,
            firstName: res.user.displayName ? res.user.displayName.split(' ')[0] : childProfile.firstName,
            avatar: childProfile.avatar,
            theme: childProfile.theme,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
      }
    }
    return res;
  };

  const loginWithEmailPasswordAction = async (email: string, pass: string) => {
    return await logInWithEmail(email, pass);
  };

  const signupWithEmailPasswordAction = async (
    email: string,
    pass: string,
    name: string,
    chosenRole: Role,
    avatar: AnimalAvatar
  ) => {
    const res = await registerWithEmail(email, pass);
    if (res.user) {
      setRoleState(chosenRole);
      setChildProfile((prev) => ({
        ...prev,
        firstName: name,
        avatar,
      }));
      try {
        await setDoc(doc(db, 'users', res.user.uid), {
          userId: res.user.uid,
          email,
          role: chosenRole,
          firstName: name,
          avatar,
          theme: childProfile.theme,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
      }
    }
    return res;
  };

  const logoutAction = async () => {
    await logOut();
    setCurrentUser(null);
  };

  // Modals for posts
  const openCreatePostModal = (type: 'photo' | 'video' | 'gif' | 'text') => {
    sounds.playPop();
    setCreatePostType(type);
  };

  const closeCreatePostModal = () => {
    sounds.playPop();
    setCreatePostType(null);
  };

  // 1-Click Publishing with Código Rojo real-time check & Firebase Firestore persistence
  const publishPost = (postData: {
    type: 'photo' | 'video' | 'gif' | 'text';
    content: string;
    mediaUrl?: string;
  }): RedCodeResult => {
    const safety = evaluateRedCode(postData.content);

    if (safety.level === 'red') {
      sounds.playRedAlarm();
      const newAlert: RedCodeAlert = {
        id: `alert-${Date.now()}`,
        timestamp: 'Justo ahora',
        childId: childProfile.id,
        childName: childProfile.firstName,
        senderAccount: `perfil_${childProfile.firstName.toLowerCase()}`,
        senderAvatar: childProfile.avatar,
        level: 'red',
        categories: safety.categories,
        detectedText: postData.content,
        explanation: safety.explanation,
        evidenceHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'active',
      };
      setRedAlerts((prev) => [newAlert, ...prev]);
      setActiveEmergencyAlert(newAlert);
      return safety;
    }

    if (safety.level === 'orange' || safety.level === 'yellow') {
      sounds.playPop();
      const newAlert: RedCodeAlert = {
        id: `alert-${Date.now()}`,
        timestamp: 'Justo ahora',
        childId: childProfile.id,
        childName: childProfile.firstName,
        senderAccount: `perfil_${childProfile.firstName.toLowerCase()}`,
        senderAvatar: childProfile.avatar,
        level: safety.level,
        categories: safety.categories,
        detectedText: postData.content,
        explanation: safety.explanation,
        evidenceHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'reviewed',
      };
      setRedAlerts((prev) => [newAlert, ...prev]);
      return safety;
    }

    // Safe to publish.
    // REGLA DE CONTENIDO (Memento, 2026-10-20): las fotos, videos y GIFs de un niño
    // NO se ven hasta que un adulto los apruebe (modo de aprobación estricta activo).
    // Así, ningún contenido visual no apto llega a mostrarse: la revisión es ANTES de publicar.
    const needsApproval =
      strictApprovalMode &&
      role === 'child' &&
      (postData.type === 'photo' || postData.type === 'video' || postData.type === 'gif');
    if (needsApproval) sounds.playPop(); else sounds.playStarCelebration();
    const postId = `post-${Date.now()}`;
    const newPost: Post = {
      id: postId,
      authorName: childProfile.firstName,
      authorAvatar: childProfile.avatar,
      authorRole: role === 'teacher' ? 'teacher' : 'child',
      timestamp: 'Hace un momento',
      type: postData.type,
      content: postData.content,
      mediaUrl: postData.mediaUrl,
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      isApprovedByParent: !needsApproval,
      badge: role === 'teacher' ? 'Maestra Verificada' : 'Mi Cuaderno',
      category: role === 'teacher' ? 'class' : 'friends',
    };

    setPosts((prev) => [newPost, ...prev]);
    if (!needsApproval) closeCreatePostModal();

    // Persist to Firestore if user is authenticated or connected
    if (currentUser) {
      const firestorePayload = {
        id: postId,
        authorId: currentUser.uid,
        authorName: childProfile.firstName,
        authorAvatar: childProfile.avatar,
        authorRole: role === 'teacher' ? 'teacher' : 'child',
        type: postData.type,
        content: postData.content,
        mediaUrl: postData.mediaUrl || '',
        likes: 1,
        commentsCount: 0,
        isApprovedByParent: !needsApproval,
        badge: role === 'teacher' ? 'Maestra Verificada' : 'Mi Cuaderno',
        category: role === 'teacher' ? 'class' : 'friends',
        createdAt: new Date().toISOString(),
      };
      setDoc(doc(db, 'posts', postId), firestorePayload).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `posts/${postId}`)
      );
    }

    return {
      ...safety,
      pendingApproval: needsApproval,
      explanation: needsApproval
        ? 'Tu foto/video quedó en revisión: un adulto debe aprobarlo antes de que se vea en ClukyBook.'
        : safety.explanation,
    };
  };

  // Comment submission with Código Rojo check & Firebase persistence
  const submitComment = (postId: string, text: string): RedCodeResult => {
    const safety = evaluateRedCode(text);

    if (safety.level === 'red') {
      sounds.playRedAlarm();
      const newAlert: RedCodeAlert = {
        id: `alert-${Date.now()}`,
        timestamp: 'Justo ahora',
        childId: childProfile.id,
        childName: childProfile.firstName,
        senderAccount: `perfil_${childProfile.firstName.toLowerCase()}`,
        senderAvatar: childProfile.avatar,
        level: 'red',
        categories: safety.categories,
        detectedText: text,
        explanation: safety.explanation,
        evidenceHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'active',
      };
      setRedAlerts((prev) => [newAlert, ...prev]);
      setActiveEmergencyAlert(newAlert);
      return safety;
    }

    if (safety.level !== 'safe') {
      sounds.playPop();
      return safety;
    }

    sounds.playPop();
    const commentId = `com-${Date.now()}`;
    const newComment: Comment = {
      id: commentId,
      postId,
      authorName: childProfile.firstName,
      authorAvatar: childProfile.avatar,
      text,
      timestamp: 'Hace un momento',
      isApproved: true,
    };

    setComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );

    // Save to Firestore
    if (currentUser) {
      setDoc(doc(db, 'posts', postId, 'comments', commentId), {
        id: commentId,
        postId,
        authorId: currentUser.uid,
        authorName: childProfile.firstName,
        authorAvatar: childProfile.avatar,
        text,
        createdAt: new Date().toISOString(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, `posts/${postId}/comments/${commentId}`));

      updateDoc(doc(db, 'posts', postId), {
        commentsCount: (posts.find((p) => p.id === postId)?.commentsCount || 0) + 1,
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`));
    }

    return safety;
  };

  const toggleLikePost = (postId: string) => {
    sounds.playPop();
    let newLikes = 0;
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          newLikes = isLiked ? post.likes + 1 : Math.max(0, post.likes - 1);
          return {
            ...post,
            isLiked,
            likes: newLikes,
          };
        }
        return post;
      })
    );

    if (currentUser) {
      updateDoc(doc(db, 'posts', postId), {
        likes: newLikes,
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`));
    }
  };

  // Safe Kid Messenger: Send Message with safety filter & Firebase persistence
  const sendMessage = (convId: string, text: string, mediaUrl?: string): RedCodeResult => {
    const safety = evaluateRedCode(text);

    if (safety.level === 'red') {
      sounds.playRedAlarm();
      const newAlert: RedCodeAlert = {
        id: `alert-${Date.now()}`,
        timestamp: 'Justo ahora en chat',
        childId: childProfile.id,
        childName: childProfile.firstName,
        senderAccount: `chat_${childProfile.firstName.toLowerCase()}`,
        senderAvatar: childProfile.avatar,
        level: 'red',
        categories: safety.categories,
        detectedText: text,
        explanation: safety.explanation,
        evidenceHash: `SHA256-CHAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'active',
      };
      setRedAlerts((prev) => [newAlert, ...prev]);
      setActiveEmergencyAlert(newAlert);
      return safety;
    }

    if (safety.level === 'orange' || safety.level === 'yellow') {
      // Regla de contenido (2026-10-20): malas palabras o señales dudosas tampoco se entregan;
      // quedan registradas para revisión de los padres, igual que en las publicaciones.
      const reviewAlert: RedCodeAlert = {
        id: `alert-${Date.now()}`,
        timestamp: 'Justo ahora en chat',
        childId: childProfile.id,
        childName: childProfile.firstName,
        senderAccount: `chat_${childProfile.firstName.toLowerCase()}`,
        senderAvatar: childProfile.avatar,
        level: safety.level,
        categories: safety.categories,
        detectedText: text,
        explanation: safety.explanation,
        evidenceHash: `SHA256-CHAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'reviewed',
      };
      setRedAlerts((prev) => [reviewAlert, ...prev]);
      return safety;
    }

    // Message is safe!
    const msgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      conversationId: convId,
      senderId: currentUser ? currentUser.uid : childProfile.id,
      senderName: childProfile.firstName,
      senderAvatar: childProfile.avatar,
      senderRole: role,
      text,
      mediaUrl,
      isSafe: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update conversation last message preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              lastMessage: text,
              lastUpdated: 'Justo ahora',
            }
          : c
      )
    );

    // Save to Firestore if connected
    if (currentUser) {
      const convDocRef = doc(db, 'conversations', convId);
      setDoc(
        convDocRef,
        {
          id: convId,
          participants: [currentUser.uid],
          lastMessage: text,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      ).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `conversations/${convId}`));

      setDoc(doc(db, 'conversations', convId, 'messages', msgId), {
        id: msgId,
        conversationId: convId,
        senderId: currentUser.uid,
        senderName: childProfile.firstName,
        senderAvatar: childProfile.avatar,
        text,
        mediaUrl: mediaUrl || '',
        isSafe: true,
        createdAt: new Date().toISOString(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, `conversations/${convId}/messages/${msgId}`));
    }

    return safety;
  };

  const startConversationWithFriend = (friend: Friend) => {
    sounds.playPop();
    let existingConv = conversations.find((c) => c.friendId === friend.id);
    if (!existingConv) {
      const newConv: Conversation = {
        id: `conv-${friend.id}`,
        participants: [childProfile.id, friend.id],
        friendId: friend.id,
        friendName: friend.firstName,
        friendAvatar: friend.avatar,
        lastMessage: 'Iniciando conversación segura...',
        lastUpdated: 'Hoy',
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    } else {
      setActiveConversationId(existingConv.id);
    }
    setActiveTab('messages');
  };

  // Submit Homework with 1-click & star confetti celebration
  const submitTask = (taskId: string, mediaUrl?: string) => {
    sounds.playStarCelebration();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
    });

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            isCompleted: true,
            submissionMediaUrl:
              mediaUrl ||
              'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80',
            submissionDate: 'Hoy, entregado con 1 clic',
          };
        }
        return t;
      })
    );

    // Add 10 stars to Luna's notebook
    setChildProfile((prev) => ({
      ...prev,
      stars: prev.stars + 10,
    }));
  };

  // Child SOS emergency click
  const triggerChildSos = () => {
    sounds.playPop();
    setIsSosModalOpen(true);
  };

  // Red Code Interactive Simulator (for testing)
  const testRedCodeSim = (text: string): RedCodeResult => {
    const result = evaluateRedCode(text);
    if (result.level === 'red') {
      sounds.playRedAlarm();
      const newAlert: RedCodeAlert = {
        id: `alert-${Date.now()}`,
        timestamp: 'En simulación de prueba',
        childId: childProfile.id,
        childName: childProfile.firstName,
        senderAccount: 'cuenta_simulada_sospechosa',
        senderAvatar: 'lion',
        level: 'red',
        categories: result.categories,
        detectedText: text,
        explanation: result.explanation,
        evidenceHash: `SHA256-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'active',
      };
      setRedAlerts((prev) => [newAlert, ...prev]);
      setActiveEmergencyAlert(newAlert);
    }
    return result;
  };

  // Red Alert 1-click emergency responses
  const handleBlockFromAlert = (alertId: string) => {
    sounds.playPop();
    const alert = redAlerts.find((a) => a.id === alertId);
    if (alert) {
      const newBlacklistEntry: BlacklistEntry = {
        id: `black-${Date.now()}`,
        accountIdentifier: alert.senderAccount,
        name: `Cuenta Bloqueada (${alert.senderAccount})`,
        dateBlocked: 'Justo ahora',
        reason: alert.explanation,
        evidenceHash: alert.evidenceHash,
      };
      setBlacklist((prev) => [newBlacklistEntry, ...prev]);
      setRedAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'blocked' } : a))
      );
    }
    setActiveEmergencyAlert(null);
  };

  const handleFreezeChildAccount = () => {
    sounds.playPop();
    setChildProfile((prev) => ({
      ...prev,
      isAccountFrozen: true,
    }));
    setActiveEmergencyAlert(null);
  };

  const unfreezeChildAccount = () => {
    sounds.playPop();
    setChildProfile((prev) => ({
      ...prev,
      isAccountFrozen: false,
    }));
  };

  const dismissEmergencyAlert = () => {
    sounds.playPop();
    setActiveEmergencyAlert(null);
  };

  const toggleScreenPause = () => {
    sounds.playPop();
    setIsScreenPaused((prev) => !prev);
  };

  // Aprobación de publicaciones en revisión (Regla de contenido, 2026-10-20)
  const approvePost = (postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isApprovedByParent: true } : p)));
    if (currentUser) {
      updateDoc(doc(db, 'posts', postId), { isApprovedByParent: true }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`)
      );
    }
  };

  const rejectPost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (currentUser) {
      deleteDoc(doc(db, 'posts', postId)).catch((err) =>
        handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`)
      );
    }
  };

  const approveFriend = (friendId: string) => {
    sounds.playStarCelebration();
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, status: 'approved' } : f))
    );
  };

  const addFriendRequest = (name: string, avatar: AnimalAvatar) => {
    sounds.playPop();
    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      firstName: name,
      avatar,
      grade: '1° Primaria',
      relation: 'Compañero de Clase',
      status: 'approved',
      color: '#3B82F6',
    };
    setFriends((prev) => [...prev, newFriend]);
    setChildProfile((prev) => ({
      ...prev,
      approvedFriendsCount: prev.approvedFriendsCount + 1,
    }));
  };

  const createChildProfile = (name: string, avatar: AnimalAvatar, theme: NotebookTheme, grade: string) => {
    sounds.playStarCelebration();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const themeNames: Record<NotebookTheme, string> = {
      'pink-purple': 'Rosa & Violeta',
      'sky-blue': 'Azul Cielo & Océano',
      'mint-green': 'Verde Menta & Selva',
      'sun-yellow': 'Amarillo Sol & Miel',
      'magic-purple': 'Morado Mágico & Estrellas',
      'cherry-red': 'Rojo Cereza & Corazón',
      'peach-orange': 'Naranja Melocotón & Dulce',
    };

    const newProfile: ChildProfile = {
      id: `child_${Date.now()}`,
      firstName: name,
      avatar,
      theme,
      themeName: themeNames[theme] || 'Rosa & Violeta',
      stars: 10,
      grade: grade || '1° de Primaria',
      parentId: 'parent_ana_1',
      approvedFriendsCount: 3,
      screenTimeTodayMinutes: 5,
      screenTimeLimitMinutes: 45,
      isAccountFrozen: false,
    };

    setChildProfile(newProfile);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        childProfile,
        updateChildTheme,
        updateChildAvatar,
        posts,
        comments,
        tasks,
        friends,
        redAlerts,
        blacklist,
        isScreenPaused,
        toggleScreenPause,
        strictApprovalMode,
        setStrictApprovalMode,

        // Auth
        currentUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle: loginWithGoogleAction,
        loginWithEmailPassword: loginWithEmailPasswordAction,
        signupWithEmailPassword: signupWithEmailPasswordAction,
        logout: logoutAction,

        // Conversations
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        sendMessage,
        startConversationWithFriend,

        // Modals & Safety
        isSosModalOpen,
        setIsSosModalOpen,
        createPostType,
        openCreatePostModal,
        closeCreatePostModal,
        activeEmergencyAlert,
        dismissEmergencyAlert,
        publishPost,
        submitComment,
        toggleLikePost,
        submitTask,
        triggerChildSos,
        testRedCodeSim,
        handleBlockFromAlert,
        handleFreezeChildAccount,
        unfreezeChildAccount,
        approveFriend,
        approvePost,
        rejectPost,
        addFriendRequest,
        createChildProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
