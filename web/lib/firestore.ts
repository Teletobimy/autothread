import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// Post types
export interface Post {
  id?: string;
  text: string;
  status: 'pending' | 'posted' | 'failed';
  language: string;
  model: string;
  createdAt?: any;
  postedAt?: any;
  permalink?: string;
  userId?: string;
}

// Queue operations
export const queueCollection = collection(db, 'queue');

// Add to queue
export async function addToQueue(post: Omit<Post, 'id' | 'createdAt'>) {
  const docRef = await addDoc(queueCollection, {
    ...post,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get posts from queue
export async function getQueue(
  status?: string,
  language?: string,
  maxResults: number = 50
) {
  const constraints: QueryConstraint[] = [];
  
  if (status) {
    constraints.push(where('status', '==', status));
  }
  if (language) {
    constraints.push(where('language', '==', language));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(maxResults));
  
  const q = query(queueCollection, ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
}

// Update post status
export async function updatePostStatus(
  postId: string,
  status: 'pending' | 'posted' | 'failed',
  permalink?: string
) {
  const docRef = doc(db, 'queue', postId);
  const updateData: any = {
    status,
  };
  
  if (status === 'posted') {
    updateData.postedAt = serverTimestamp();
    if (permalink) {
      updateData.permalink = permalink;
    }
  }
  
  await updateDoc(docRef, updateData);
}

// Delete post
export async function deletePost(postId: string) {
  const docRef = doc(db, 'queue', postId);
  await deleteDoc(docRef);
}

// User settings
export interface UserSettings {
  threadsToken?: string;
  openaiKey?: string;
  googleKey?: string;
  defaultModel?: string;
  defaultLanguage?: string;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const docRef = doc(db, 'settings', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserSettings;
  }
  return null;
}

export async function saveUserSettings(userId: string, settings: Partial<UserSettings>) {
  const docRef = doc(db, 'settings', userId);
  await updateDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  });
}
