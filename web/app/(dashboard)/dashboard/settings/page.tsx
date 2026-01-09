'use client';

import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateOrganization, PLAN_LIMITS } from '@/lib/organizations';

export default function SettingsPage() {
  const { user } = useAuth();
  const { currentOrg, memberRole, refreshOrganizations } = useOrganization();
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveOrg = async () => {
    if (!currentOrg) return;

    setSaving(true);
    setMessage('');

    try {
      await updateOrganization(currentOrg.id, { name: orgName });
      await refreshOrganizations();
      setMessage('Settings saved successfully');
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const planLimits = currentOrg ? PLAN_LIMITS[currentOrg.plan] : PLAN_LIMITS.free;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your organization and account settings</p>
      </div>

      {/* Organization Settings */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Organization</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={memberRole !== 'owner' && memberRole !== 'admin'}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--gradient-start)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization ID
            </label>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-mono text-sm">
              {currentOrg?.id || 'N/A'}
            </div>
          </div>

          {(memberRole === 'owner' || memberRole === 'admin') && (
            <button
              onClick={handleSaveOrg}
              disabled={saving || orgName === currentOrg?.name}
              className="btn-primary px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Plan & Usage */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Plan & Usage</h2>
          <span className="px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium capitalize">
            {currentOrg?.plan || 'free'} Plan
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-gray-400 text-sm">Posts / Month</p>
            <p className="text-2xl font-bold text-white mt-1">
              {planLimits.postsPerMonth === -1 ? 'Unlimited' : planLimits.postsPerMonth}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-gray-400 text-sm">Team Members</p>
            <p className="text-2xl font-bold text-white mt-1">
              {planLimits.members === -1 ? 'Unlimited' : planLimits.members}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-gray-400 text-sm">Tools Available</p>
            <p className="text-2xl font-bold text-white mt-1">
              {planLimits.tools === -1 ? 'Unlimited' : planLimits.tools}
            </p>
          </div>
        </div>

        {currentOrg?.plan === 'free' && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[var(--gradient-start)]/10 to-[var(--gradient-mid)]/10 border border-[var(--gradient-start)]/30">
            <p className="text-white font-medium">Upgrade to Pro</p>
            <p className="text-gray-400 text-sm mt-1">
              Get more posts, team members, and access to all tools.
            </p>
            <button className="mt-3 btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium">
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Account</h2>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-white font-medium">{user?.displayName || 'User'}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 capitalize">
              {memberRole || 'member'}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {memberRole === 'owner' && (
        <div className="glass rounded-2xl border border-red-500/30 p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-4">
            Deleting your organization is irreversible. All data will be permanently lost.
          </p>
          <button className="px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">
            Delete Organization
          </button>
        </div>
      )}
    </div>
  );
}
