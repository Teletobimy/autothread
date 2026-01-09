'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      setLoading(false);
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
