'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createOrganization } from '@/lib/organizations';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isDemo, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo mode: skip onboarding entirely
  useEffect(() => {
    if (!authLoading && isDemo) {
      console.log('Demo mode detected, redirecting to dashboard');
      router.push('/dashboard/threads');
    }
  }, [authLoading, isDemo, router]);

  const handleCreateOrg = async () => {
    console.log('handleCreateOrg called', { user, orgName, isDemo });
    
    if (!user) {
      console.log('No user found!');
      setError('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }
    
    if (!orgName.trim()) {
      console.log('Organization name is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating organization...', { uid: user.uid, email: user.email, orgName: orgName.trim() });
      await createOrganization(
        user.uid,
        user.email || '',
        orgName.trim(),
        user.displayName || undefined
      );
      console.log('Organization created successfully');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to create organization:', err);
      setError(err.message || 'Failed to create organization. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking demo mode
  if (authLoading || isDemo) {
    return (
      <div className="w-full max-w-lg">
        <div className="glass rounded-2xl border border-white/10 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[var(--gradient-start)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="glass rounded-2xl border border-white/10 p-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'gradient-bg' : 'bg-white/10'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'gradient-bg' : 'bg-white/10'}`} />
        </div>

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-3xl mx-auto mb-4">
                👋
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome to Utilix!
              </h1>
              <p className="text-gray-400">
                Let&apos;s set up your workspace in just a few steps.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  ✓
                </div>
                <div>
                  <p className="text-white font-medium">Account created</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-[var(--gradient-start)]/20 flex items-center justify-center text-[var(--gradient-start)]">
                  2
                </div>
                <div>
                  <p className="text-white font-medium">Create organization</p>
                  <p className="text-gray-400 text-sm">Set up your workspace</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full btn-primary py-3 rounded-xl text-white font-semibold"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-3xl mx-auto mb-4">
                🏢
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Create your organization
              </h1>
              <p className="text-gray-400">
                This is where you&apos;ll manage your tools and team.
              </p>
            </div>

            {/* Debug info */}
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
              <p>User: {user ? user.email : 'Not logged in'}</p>
              <p>Demo: {isDemo ? 'Yes' : 'No'}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="My Company"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--gradient-start)]"
              />
              <p className="mt-2 text-gray-500 text-sm">
                You can change this later in settings.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 btn-secondary py-3 rounded-xl text-white font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleCreateOrg}
                disabled={loading || !orgName.trim()}
                className="flex-1 btn-primary py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
            
            {/* Skip option for testing */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  localStorage.setItem('demoMode', 'true');
                  window.location.href = '/dashboard/threads';
                }}
                className="text-gray-500 hover:text-gray-300 text-sm underline"
              >
                데모로 먼저 둘러보기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
