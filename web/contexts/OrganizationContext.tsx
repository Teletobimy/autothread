'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  Organization,
  UserProfile,
  getOrCreateUserProfile,
  getUserOrganizations,
  getOrganization,
  setCurrentOrganization,
  createOrganization,
  getMemberRole,
  MemberRole,
} from '@/lib/organizations';

interface OrganizationContextType {
  // Current state
  currentOrg: Organization | null;
  organizations: Organization[];
  userProfile: UserProfile | null;
  memberRole: MemberRole | null;
  
  // Loading states
  loading: boolean;
  switching: boolean;
  
  // Actions
  switchOrganization: (orgId: string) => Promise<void>;
  createNewOrganization: (name: string) => Promise<Organization>;
  refreshOrganizations: () => Promise<void>;
}

// Demo mode mock data
const DEMO_ORG: Organization = {
  id: 'demo-org-id',
  name: 'Demo Organization',
  plan: 'pro',
  ownerId: 'demo-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  displayName: 'Demo User',
  orgIds: ['demo-org-id'],
  currentOrgId: 'demo-org-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth();
  
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [memberRole, setMemberRole] = useState<MemberRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  // Load user profile and organizations
  const loadUserData = useCallback(async () => {
    if (!user) {
      setCurrentOrg(null);
      setOrganizations([]);
      setUserProfile(null);
      setMemberRole(null);
      setLoading(false);
      return;
    }

    // Handle demo mode with mock data
    if (isDemo) {
      setUserProfile(DEMO_USER_PROFILE);
      setOrganizations([DEMO_ORG]);
      setCurrentOrg(DEMO_ORG);
      setMemberRole('owner');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get or create user profile
      const profile = await getOrCreateUserProfile(
        user.uid,
        user.email || '',
        user.displayName || undefined,
        user.photoURL || undefined
      );
      setUserProfile(profile);

      // Get user's organizations
      const orgs = await getUserOrganizations(user.uid);
      setOrganizations(orgs);

      // Set current organization
      if (profile.currentOrgId && orgs.some(o => o.id === profile.currentOrgId)) {
        const org = orgs.find(o => o.id === profile.currentOrgId)!;
        setCurrentOrg(org);
        
        // Get member role
        const role = await getMemberRole(user.uid, org.id);
        setMemberRole(role);
      } else if (orgs.length > 0) {
        // Default to first organization
        setCurrentOrg(orgs[0]);
        const role = await getMemberRole(user.uid, orgs[0].id);
        setMemberRole(role);
        await setCurrentOrganization(user.uid, orgs[0].id);
      } else {
        setCurrentOrg(null);
        setMemberRole(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Switch to a different organization
  const switchOrganization = async (orgId: string) => {
    if (!user) return;

    setSwitching(true);
    try {
      const org = await getOrganization(orgId);
      if (org) {
        setCurrentOrg(org);
        await setCurrentOrganization(user.uid, orgId);
        
        const role = await getMemberRole(user.uid, orgId);
        setMemberRole(role);
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      throw error;
    } finally {
      setSwitching(false);
    }
  };

  // Create a new organization
  const createNewOrganization = async (name: string): Promise<Organization> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const org = await createOrganization(
      user.uid,
      user.email || '',
      name,
      user.displayName || undefined
    );

    // Refresh organizations list
    await loadUserData();

    return org;
  };

  // Refresh organizations
  const refreshOrganizations = async () => {
    await loadUserData();
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrg,
        organizations,
        userProfile,
        memberRole,
        loading,
        switching,
        switchOrganization,
        createNewOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
