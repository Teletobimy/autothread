'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle, signOut } from '@/lib/auth';

export function AuthButton() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-lg"></div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt={user.displayName || 'User'}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {user.displayName || user.email}
        </span>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : '로그아웃'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
    >
      {isLoading ? '로그인 중...' : '🔐 Google 로그인'}
    </button>
  );
}
