'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
}

// Mock user for demo mode
const DEMO_USER = {
  uid: 'demo-user-id',
  email: 'demo@example.com',
  displayName: 'Demo User',
  photoURL: null,
  emailVerified: true,
} as unknown as User;

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemo: false,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Check for demo mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoMode = localStorage.getItem('demoMode') === 'true';
      if (demoMode) {
        setIsDemo(true);
        setUser(DEMO_USER);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Skip Firebase auth if in demo mode
    if (isDemo) {
      return;
    }

    // Dynamically import auth to avoid SSR issues
    import('@/lib/auth').then(({ onAuthChange }) => {
      const unsubscribe = onAuthChange((user) => {
        setUser(user);
        setLoading(false);
      });
      
      // Store unsubscribe for cleanup
      (window as any).__authUnsubscribe = unsubscribe;
    }).catch(() => {
      // Firebase not available
      setLoading(false);
    });

    return () => {
      const unsubscribe = (window as any).__authUnsubscribe;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isDemo]);

  const enableDemoMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demoMode', 'true');
    }
    setIsDemo(true);
    setUser(DEMO_USER);
    setLoading(false);
  };

  const disableDemoMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demoMode');
    }
    setIsDemo(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, enableDemoMode, disableDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
