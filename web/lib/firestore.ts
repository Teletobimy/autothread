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
  QueryConstraint,
  setDoc,
  increment,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Collection name constant
const ORGS_COLLECTION = 'orgs';

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
  createdBy?: string;
}

// ============ Multi-tenant Queue Operations ============

// Get queue collection reference for an organization
function getQueueCollection(orgId: string) {
  const db = getFirebaseDb();
  return collection(db, ORGS_COLLECTION, orgId, 'tools', 'threads', 'queue');
}

// Add to queue (multi-tenant)
export async function addToQueue(
  orgId: string,
  post: Omit<Post, 'id' | 'createdAt'>,
  userId: string
) {
  const queueRef = getQueueCollection(orgId);
  const docRef = await addDoc(queueRef, {
    ...post,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get posts from queue (multi-tenant)
export async function getQueue(
  orgId: string,
  status?: string,
  language?: string,
  maxResults: number = 50
): Promise<Post[]> {
  const queueRef = getQueueCollection(orgId);
  const constraints: QueryConstraint[] = [];
  
  if (status) {
    constraints.push(where('status', '==', status));
  }
  if (language) {
    constraints.push(where('language', '==', language));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(maxResults));
  
  const q = query(queueRef, ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
}

// Update post status (multi-tenant)
export async function updatePostStatus(
  orgId: string,
  postId: string,
  status: 'pending' | 'posted' | 'failed',
  permalink?: string
) {
  const db = getFirebaseDb();
  const docRef = doc(db, ORGS_COLLECTION, orgId, 'tools', 'threads', 'queue', postId);
  const updateData: Record<string, any> = {
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

// Delete post (multi-tenant)
export async function deletePost(orgId: string, postId: string) {
  const db = getFirebaseDb();
  const docRef = doc(db, ORGS_COLLECTION, orgId, 'tools', 'threads', 'queue', postId);
  await deleteDoc(docRef);
}

// ============ Tool Configuration ============

export interface ThreadsConfig {
  accessToken?: string;
  userId?: string;
  username?: string;
  enabled: boolean;
}

// Get threads tool config
export async function getThreadsConfig(orgId: string): Promise<ThreadsConfig | null> {
  const db = getFirebaseDb();
  const configRef = doc(db, ORGS_COLLECTION, orgId, 'tools', 'threads', 'config', 'main');
  const configSnap = await getDoc(configRef);
  
  if (configSnap.exists()) {
    return configSnap.data() as ThreadsConfig;
  }
  
  // Return default config if not exists
  const toolRef = doc(db, ORGS_COLLECTION, orgId, 'tools', 'threads');
  const toolSnap = await getDoc(toolRef);
  
  if (toolSnap.exists()) {
    return { enabled: toolSnap.data().enabled || false };
  }
  
  return null;
}

// Save threads tool config
export async function saveThreadsConfig(
  orgId: string,
  config: Partial<ThreadsConfig>
): Promise<void> {
  const db = getFirebaseDb();
  const configRef = doc(db, ORGS_COLLECTION, orgId, 'tools', 'threads', 'config', 'main');
  await updateDoc(configRef, {
    ...config,
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    // If document doesn't exist, create it
    await setDoc(configRef, {
      ...config,
      createdAt: serverTimestamp(),
    });
  });
}

// ============ Organization Settings ============

export interface OrgSettings {
  timezone?: string;
  language?: string;
  defaultModel?: string;
}

// Get organization settings
export async function getOrgSettings(orgId: string): Promise<OrgSettings | null> {
  const db = getFirebaseDb();
  const settingsRef = doc(db, ORGS_COLLECTION, orgId, 'settings', 'general');
  const settingsSnap = await getDoc(settingsRef);
  
  if (settingsSnap.exists()) {
    return settingsSnap.data() as OrgSettings;
  }
  return null;
}

// Save organization settings
export async function saveOrgSettings(
  orgId: string,
  settings: Partial<OrgSettings>
): Promise<void> {
  const db = getFirebaseDb();
  const settingsRef = doc(db, ORGS_COLLECTION, orgId, 'settings', 'general');
  await updateDoc(settingsRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    await setDoc(settingsRef, {
      ...settings,
      createdAt: serverTimestamp(),
    });
  });
}

// ============ Usage Tracking ============

export interface UsageStats {
  postsThisMonth: number;
  lastResetDate: any;
}

// Get usage stats for organization
export async function getUsageStats(orgId: string): Promise<UsageStats> {
  const db = getFirebaseDb();
  const statsRef = doc(db, ORGS_COLLECTION, orgId, 'settings', 'usage');
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    return statsSnap.data() as UsageStats;
  }
  
  return {
    postsThisMonth: 0,
    lastResetDate: serverTimestamp(),
  };
}

// Increment post count
export async function incrementPostCount(orgId: string): Promise<void> {
  const db = getFirebaseDb();
  const statsRef = doc(db, ORGS_COLLECTION, orgId, 'settings', 'usage');
  
  try {
    await updateDoc(statsRef, {
      postsThisMonth: increment(1),
    });
  } catch {
    await setDoc(statsRef, {
      postsThisMonth: 1,
      lastResetDate: serverTimestamp(),
    });
  }
}

// ============ Legacy Support (for migration) ============

// Get posts from legacy queue
export async function getLegacyQueue(
  status?: string,
  language?: string,
  maxResults: number = 50
): Promise<Post[]> {
  const db = getFirebaseDb();
  const legacyQueueCollection = collection(db, 'queue');
  const constraints: QueryConstraint[] = [];
  
  if (status) {
    constraints.push(where('status', '==', status));
  }
  if (language) {
    constraints.push(where('language', '==', language));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(maxResults));
  
  const q = query(legacyQueueCollection, ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
}
