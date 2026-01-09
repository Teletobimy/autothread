import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Types
export type PlanType = 'free' | 'pro' | 'enterprise';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  ownerId: string;
  createdAt: any;
  updatedAt?: any;
  logoUrl?: string;
  description?: string;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: MemberRole;
  joinedAt: any;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  orgIds: string[];       // 변경: organizations → orgIds
  currentOrgId?: string;
  createdAt: any;
}

export interface Invitation {
  id: string;
  orgId: string;
  orgName: string;
  email: string;
  role: MemberRole;
  invitedBy: string;
  createdAt: any;
  expiresAt: any;
  status: 'pending' | 'accepted' | 'expired';
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    tools: 1,
    postsPerMonth: 100,
    members: 1,
  },
  pro: {
    tools: 10,
    postsPerMonth: 1000,
    members: 5,
  },
  enterprise: {
    tools: -1, // unlimited
    postsPerMonth: -1, // unlimited
    members: -1, // unlimited
  },
};

// Collection name constant
const ORGS_COLLECTION = 'orgs';

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// ============ Organization Operations ============

// Create a new organization
export async function createOrganization(
  userId: string,
  userEmail: string,
  name: string,
  displayName?: string
): Promise<Organization> {
  const db = getFirebaseDb();
  
  console.log('Step 1: Creating organization document...');
  // Step 1: Create organization document first
  const orgRef = doc(collection(db, ORGS_COLLECTION));
  const orgData: Omit<Organization, 'id'> = {
    name,
    slug: generateSlug(name),
    plan: 'free',
    ownerId: userId,
    createdAt: serverTimestamp(),
  };
  
  try {
    await setDoc(orgRef, orgData);
    console.log('Step 1 complete: Org created with ID:', orgRef.id);
  } catch (err) {
    console.error('Step 1 failed:', err);
    throw new Error('Failed to create organization document');
  }
  
  console.log('Step 2: Adding creator as owner member...');
  // Step 2: Add creator as owner member (now org exists, so rules can check ownerId)
  const memberRef = doc(db, ORGS_COLLECTION, orgRef.id, 'members', userId);
  try {
    await setDoc(memberRef, {
      userId,
      email: userEmail,
      displayName: displayName || userEmail.split('@')[0],
      role: 'owner',
      joinedAt: serverTimestamp(),
    });
    console.log('Step 2 complete: Member added');
  } catch (err) {
    console.error('Step 2 failed:', err);
    throw new Error('Failed to add member document');
  }
  
  console.log('Step 3: Updating user orgIds...');
  // Step 3: Update user's orgIds list
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, {
      orgIds: arrayUnion(orgRef.id),
      currentOrgId: orgRef.id,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('Step 3 complete: User updated');
  } catch (err) {
    console.error('Step 3 failed:', err);
    throw new Error('Failed to update user document');
  }
  
  console.log('Step 4: Creating tools document...');
  // Step 4: Create default tools document (now member exists, so admin check passes)
  const threadsToolRef = doc(db, ORGS_COLLECTION, orgRef.id, 'tools', 'threads');
  try {
    await setDoc(threadsToolRef, {
      enabled: true,
      createdAt: serverTimestamp(),
    });
    console.log('Step 4 complete: Tools created');
  } catch (err) {
    console.error('Step 4 failed:', err);
    throw new Error('Failed to create tools document');
  }
  
  console.log('Organization creation complete!');
  return {
    id: orgRef.id,
    ...orgData,
  } as Organization;
}

// Get organization by ID
export async function getOrganization(orgId: string): Promise<Organization | null> {
  const db = getFirebaseDb();
  const docRef = doc(db, ORGS_COLLECTION, orgId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Organization;
  }
  return null;
}

// Get user's organizations
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return [];
  }
  
  const userData = userSnap.data();
  const orgIds = userData.orgIds || userData.organizations || []; // 하위 호환성
  
  const organizations: Organization[] = [];
  for (const orgId of orgIds) {
    const org = await getOrganization(orgId);
    if (org) {
      organizations.push(org);
    }
  }
  
  return organizations;
}

// Update organization
export async function updateOrganization(
  orgId: string,
  data: Partial<Pick<Organization, 'name' | 'description' | 'logoUrl'>>
): Promise<void> {
  const db = getFirebaseDb();
  const docRef = doc(db, ORGS_COLLECTION, orgId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete organization
export async function deleteOrganization(orgId: string): Promise<void> {
  const db = getFirebaseDb();
  // Note: In production, you'd want to delete subcollections too
  // or use a Cloud Function for cascading deletes
  const docRef = doc(db, ORGS_COLLECTION, orgId);
  await deleteDoc(docRef);
}

// ============ Member Operations ============

// Get organization members
export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const db = getFirebaseDb();
  const membersRef = collection(db, ORGS_COLLECTION, orgId, 'members');
  const snapshot = await getDocs(membersRef);
  
  return snapshot.docs.map(doc => ({
    userId: doc.id,
    ...doc.data(),
  })) as OrganizationMember[];
}

// Check if user is member of organization
export async function isMemberOf(userId: string, orgId: string): Promise<boolean> {
  const db = getFirebaseDb();
  const memberRef = doc(db, ORGS_COLLECTION, orgId, 'members', userId);
  const memberSnap = await getDoc(memberRef);
  return memberSnap.exists();
}

// Get member role
export async function getMemberRole(userId: string, orgId: string): Promise<MemberRole | null> {
  const db = getFirebaseDb();
  const memberRef = doc(db, ORGS_COLLECTION, orgId, 'members', userId);
  const memberSnap = await getDoc(memberRef);
  
  if (memberSnap.exists()) {
    return memberSnap.data().role as MemberRole;
  }
  return null;
}

// Update member role
export async function updateMemberRole(
  orgId: string,
  memberId: string,
  newRole: MemberRole
): Promise<void> {
  const db = getFirebaseDb();
  const memberRef = doc(db, ORGS_COLLECTION, orgId, 'members', memberId);
  await updateDoc(memberRef, { role: newRole });
}

// Remove member from organization
export async function removeMember(orgId: string, memberId: string): Promise<void> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  
  // Remove from members subcollection
  const memberRef = doc(db, ORGS_COLLECTION, orgId, 'members', memberId);
  batch.delete(memberRef);
  
  // Remove org from user's orgIds list
  const userRef = doc(db, 'users', memberId);
  batch.update(userRef, {
    orgIds: arrayRemove(orgId),
  });
  
  await batch.commit();
}

// ============ Invitation Operations (조직 내부) ============

// Create invitation (now inside org)
export async function createInvitation(
  orgId: string,
  orgName: string,
  email: string,
  role: MemberRole,
  invitedBy: string
): Promise<string> {
  const db = getFirebaseDb();
  // 초대장을 조직 내부에 저장
  const inviteRef = await addDoc(collection(db, ORGS_COLLECTION, orgId, 'invitations'), {
    orgId,
    orgName,
    email: email.toLowerCase(),
    role,
    invitedBy,
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  
  return inviteRef.id;
}

// Get pending invitations for an organization
export async function getOrgInvitations(orgId: string): Promise<Invitation[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, ORGS_COLLECTION, orgId, 'invitations'),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Invitation[];
}

// Accept invitation
export async function acceptInvitation(
  orgId: string,
  inviteId: string,
  userId: string,
  userEmail: string,
  displayName?: string
): Promise<void> {
  const db = getFirebaseDb();
  const inviteRef = doc(db, ORGS_COLLECTION, orgId, 'invitations', inviteId);
  const inviteSnap = await getDoc(inviteRef);
  
  if (!inviteSnap.exists()) {
    throw new Error('Invitation not found');
  }
  
  const invite = inviteSnap.data() as Invitation;
  
  if (invite.status !== 'pending') {
    throw new Error('Invitation is no longer valid');
  }
  
  const batch = writeBatch(db);
  
  // Add user as member
  const memberRef = doc(db, ORGS_COLLECTION, orgId, 'members', userId);
  batch.set(memberRef, {
    userId,
    email: userEmail,
    displayName: displayName || userEmail.split('@')[0],
    role: invite.role,
    joinedAt: serverTimestamp(),
  });
  
  // Update user's orgIds
  const userRef = doc(db, 'users', userId);
  batch.set(userRef, {
    orgIds: arrayUnion(orgId),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  
  // Update invitation status
  batch.update(inviteRef, { status: 'accepted' });
  
  await batch.commit();
}

// Delete invitation
export async function deleteInvitation(orgId: string, inviteId: string): Promise<void> {
  const db = getFirebaseDb();
  const inviteRef = doc(db, ORGS_COLLECTION, orgId, 'invitations', inviteId);
  await deleteDoc(inviteRef);
}

// ============ User Profile Operations ============

// Get or create user profile
export async function getOrCreateUserProfile(
  userId: string,
  email: string,
  displayName?: string,
  photoURL?: string
): Promise<UserProfile> {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return { 
      id: userSnap.id, 
      ...data,
      orgIds: data.orgIds || data.organizations || [], // 하위 호환성
    } as UserProfile;
  }
  
  // Create new user profile
  const userData: Omit<UserProfile, 'id'> = {
    email,
    displayName: displayName || email.split('@')[0],
    photoURL,
    orgIds: [],
    createdAt: serverTimestamp(),
  };
  
  await setDoc(userRef, userData);
  
  return { id: userId, ...userData } as UserProfile;
}

// Update current organization
export async function setCurrentOrganization(userId: string, orgId: string): Promise<void> {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    currentOrgId: orgId,
    updatedAt: serverTimestamp(),
  });
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return { 
      id: userSnap.id, 
      ...data,
      orgIds: data.orgIds || data.organizations || [], // 하위 호환성
    } as UserProfile;
  }
  return null;
}
