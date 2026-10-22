import { initializeApp } from 'firebase/app';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId from firebaseConfig
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * Uploads a user-selected media file to Firebase Storage.
 * Files are kept out of Firestore documents so videos do not exceed Firestore's
 * document-size limit. Requires a signed-in Firebase user and matching Storage rules.
 */
export async function uploadUserMedia(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Inicia sesión para guardar fotos, videos o GIFs en línea.');
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || 'media';
  const path = `users/${user.uid}/media/${Date.now()}-${safeName}`;
  const destination = storageRef(storage, path);
  await uploadBytes(destination, file, { contentType: file.type || 'application/octet-stream' });
  return getDownloadURL(destination);
}
export const googleProvider = new GoogleAuthProvider();

// Error Handling Specification matching FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  // Return formatted error without abruptly throwing when offline or unauthenticated
  return errInfo;
}

// Connection Validation
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Conexión con Firebase Firestore verificada con éxito.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase en modo offline o esperando red activa.');
    }
    return false;
  }
}

// Test connection on initialization
if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
    return { user: null, error: msg };
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrarse';
    return { user: null, error: msg };
  }
};

export const logInWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
    return { user: null, error: msg };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Error signing out:', err);
  }
};

export type { User };
export { onAuthStateChanged };
