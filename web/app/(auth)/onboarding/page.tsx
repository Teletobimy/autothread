'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createOrganization } from '@/lib/organizations';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateOrg = async () => {
    if (!user || !orgName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await createOrganization(
        user.uid,
        user.email || '',
        orgName.trim(),
        user.displayName || undefined
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

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
          </>
        )}
      </div>
    </div>
  );
}
