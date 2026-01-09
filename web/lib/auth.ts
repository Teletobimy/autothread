import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, getGoogleProvider } from './firebase';

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const auth = getFirebaseAuth();
    const googleProvider = getGoogleProvider();
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update user document in Firestore
    await createOrUpdateUser(user);
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
  try {
    const auth = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign up with email/password
export async function signUpWithEmail(email: string, password: string) {
  try {
    const auth = getFirebaseAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Create user document in Firestore
    await createOrUpdateUser(user);
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign out
export async function signOut() {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Create or update user document
async function createOrUpdateUser(user: User) {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, {
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void) {
  try {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    // Firebase not initialized, return no-op unsubscribe
    console.warn('Firebase Auth not initialized:', error);
    callback(null);
    return () => {};
  }
}

// Get current user
export function getCurrentUser() {
  try {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  } catch {
    return null;
  }
}
