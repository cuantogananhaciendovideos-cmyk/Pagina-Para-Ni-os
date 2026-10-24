export type Role = 'child' | 'parent' | 'teacher';

export type AnimalAvatar = 'fox' | 'cat' | 'panda' | 'rabbit' | 'owl' | 'lion' | 'dog' | 'koala' | 'penguin';

export type NotebookTheme = 
  | 'pink-purple' 
  | 'sky-blue' 
  | 'mint-green' 
  | 'sun-yellow' 
  | 'magic-purple' 
  | 'cherry-red' 
  | 'peach-orange';

export interface ChildProfile {
  id: string;
  firstName: string; // Strictly first name only (e.g. Luna)
  avatar: AnimalAvatar;
  avatarUrl?: string;
  theme: NotebookTheme;
  themeName: string;
  stars: number;
  grade: string;
  parentId: string;
  approvedFriendsCount: number;
  screenTimeTodayMinutes: number;
  screenTimeLimitMinutes: number;
  isAccountFrozen: boolean;
}

export type ThreatLevel = 'safe' | 'yellow' | 'orange' | 'red';

export type ThreatCategory = 
  | 'pedir_secreto' 
  | 'citas_escondidas' 
  | 'sacar_de_plataforma' 
  | 'pedir_datos_personales' 
  | 'pedir_fotos' 
  | 'regalos_sobornos' 
  | 'amenazas_miedo'
  | 'lenguaje_ofensivo'
  | 'contenido_no_apto';

export interface RedCodeResult {
  isSafe: boolean;
  level: ThreatLevel;
  categories: ThreatCategory[];
  detectedPatterns: string[];
  normalizedText: string;
  explanation: string;
  actionTaken: 'published' | 'retained_for_parent' | 'blocked_and_notified' | 'frozen_and_emergency_alarm';
  pendingApproval?: boolean;
}

export interface RedCodeAlert {
  id: string;
  timestamp: string;
  childId: string;
  childName: string;
  senderAccount: string;
  senderAvatar: AnimalAvatar;
  level: ThreatLevel;
  categories: ThreatCategory[];
  detectedText: string;
  explanation: string;
  evidenceHash: string;
  status: 'active' | 'blocked' | 'frozen' | 'reviewed';
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: AnimalAvatar;
  authorRole: 'child' | 'teacher' | 'parent';
  timestamp: string;
  type: 'photo' | 'video' | 'gif' | 'text' | 'drawing';
  title?: string;
  content: string;
  mediaUrl?: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  isApprovedByParent: boolean;
  badge?: string; // e.g. "Mi Clase", "Familia", "Amigo"
  category?: 'class' | 'friends' | 'family';
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: AnimalAvatar;
  text: string;
  timestamp: string;
  isApproved: boolean;
}

export interface ClassTask {
  id: string;
  title: string;
  description: string;
  rewardStars: number;
  dueDate: string;
  teacherName: string;
  isCompleted: boolean;
  submissionMediaUrl?: string;
  submissionDate?: string;
}

export interface Friend {
  id: string;
  firstName: string;
  avatar: AnimalAvatar;
  grade: string;
  relation: 'Compañero de Clase' | 'Primo/a' | 'Amigo del Parque' | 'Amigo Imaginario' | string;
  status: 'approved' | 'pending_parent_approval';
  color: string;
  isImaginary?: boolean;
  tipMessage?: string;
}

export interface BlacklistEntry {
  id: string;
  accountIdentifier: string;
  name: string;
  dateBlocked: string;
  reason: string;
  evidenceHash: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: AnimalAvatar;
  senderRole?: 'child' | 'parent' | 'teacher';
  text: string;
  mediaUrl?: string;
  isSafe: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  friendName: string;
  friendAvatar: AnimalAvatar;
  friendId: string;
  lastMessage: string;
  lastUpdated: string;
}

