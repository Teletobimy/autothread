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

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Always check Firebase auth first - real login takes priority over demo mode
    import('@/lib/auth').then(({ onAuthChange }) => {
      const unsubscribe = onAuthChange((firebaseUser) => {
        if (firebaseUser) {
          // Real user logged in - disable demo mode
          localStorage.removeItem('demoMode');
          setIsDemo(false);
          setUser(firebaseUser);
        } else {
          // No real user - check if we should use demo mode
          const demoMode = localStorage.getItem('demoMode') === 'true';
          if (demoMode) {
            setIsDemo(true);
            setUser(DEMO_USER);
          } else {
            setIsDemo(false);
            setUser(null);
          }
        }
        setLoading(false);
      });
      
      // Store unsubscribe for cleanup
      (window as any).__authUnsubscribe = unsubscribe;
    }).catch(() => {
      // Firebase not available - check demo mode
      const demoMode = localStorage.getItem('demoMode') === 'true';
      if (demoMode) {
        setIsDemo(true);
        setUser(DEMO_USER);
      }
      setLoading(false);
    });

    return () => {
      const unsubscribe = (window as any).__authUnsubscribe;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
