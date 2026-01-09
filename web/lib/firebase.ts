import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'project-4d38b.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'project-4d38b',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'project-4d38b.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '229679006764',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase can be initialized
const canInitialize = typeof window !== 'undefined' && firebaseConfig.apiKey;

// Initialize Firebase only if we have the API key and we're in the browser
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

function initFirebase() {
  if (!canInitialize) return;
  
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  storage = getStorage(app);
}

// Initialize on first import in browser
if (canInitialize) {
  initFirebase();
}

// Export getters that initialize on demand
export function getFirebaseAuth(): Auth {
  if (!auth) {
    initFirebase();
  }
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set.');
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    initFirebase();
  }
  if (!db) {
    throw new Error('Firestore not initialized. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set.');
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    initFirebase();
  }
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set.');
  }
  return storage;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    initFirebase();
  }
  if (!googleProvider) {
    throw new Error('Google Provider not initialized. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set.');
  }
  return googleProvider;
}

// Legacy exports for backward compatibility
export { auth, db, storage, googleProvider };
export default app;
