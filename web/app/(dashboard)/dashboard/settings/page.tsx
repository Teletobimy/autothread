'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { updateOrganization, PLAN_LIMITS } from '@/lib/organizations';
import { getThreadsConfig, saveThreadsConfig, ThreadsConfig } from '@/lib/firestore';

export default function SettingsPage() {
  const { user } = useAuth();
  const { currentOrg, memberRole, refreshOrganizations } = useOrganization();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'threads' | 'team'>('general');

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t.settings.title}</h1>
        <p className="text-gray-400 mt-1">Manage your organization and integrations</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5">
        <TabButton 
          active={activeTab === 'general'} 
          onClick={() => setActiveTab('general')} 
          label={t.settings.organization} 
        />
        <TabButton 
          active={activeTab === 'threads'} 
          onClick={() => setActiveTab('threads')} 
          label="Threads API" 
        />
        <TabButton 
          active={activeTab === 'team'} 
          onClick={() => setActiveTab('team')} 
          label="Team" 
        />
      </div>

      {/* Content */}
      {activeTab === 'general' && (
        <GeneralSettings 
          user={user} 
          currentOrg={currentOrg} 
          memberRole={memberRole} 
          refreshOrganizations={refreshOrganizations}
          t={t}
        />
      )}
      {activeTab === 'threads' && (
        <ThreadsSettings 
          orgId={currentOrg.id} 
          memberRole={memberRole}
          t={t}
        />
      )}
      {activeTab === 'team' && (
        <TeamSettings 
          orgId={currentOrg.id} 
          memberRole={memberRole}
          t={t}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
        active
          ? 'gradient-bg text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

// General Settings Tab
function GeneralSettings({ user, currentOrg, memberRole, refreshOrganizations, t }: any) {
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

  const planLimits = currentOrg ? PLAN_LIMITS[currentOrg.plan as keyof typeof PLAN_LIMITS] : PLAN_LIMITS.free;

  return (
    <div className="space-y-8">
      {/* Organization Settings */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">{t.settings.organization}</h2>
        
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
              {saving ? t.common.loading : t.settings.save}
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
        <h2 className="text-xl font-semibold text-white mb-6">{t.settings.profile}</h2>
        
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

// Threads API Settings Tab
function ThreadsSettings({ orgId, memberRole, t }: { orgId: string; memberRole: string | null; t: any }) {
  const [config, setConfig] = useState<ThreadsConfig | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, [orgId]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await getThreadsConfig(orgId);
      setConfig(data);
      if (data) {
        setAccessToken(data.accessToken || '');
        setUserId(data.userId || '');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await saveThreadsConfig(orgId, {
        accessToken,
        userId,
        enabled: true,
      });
      setMessage({ type: 'success', text: 'Threads API settings saved successfully!' });
      await loadConfig();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!accessToken) {
      setMessage({ type: 'error', text: 'Please enter Access Token first' });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      // Always use 'me' endpoint to get the correct numeric user ID
      console.log('Fetching user ID from me endpoint...');
      const meResponse = await fetch(
        `https://graph.threads.net/v1.0/me?fields=id,username,name&access_token=${accessToken}`
      );
      
      if (!meResponse.ok) {
        const errorData = await meResponse.json().catch(() => ({}));
        console.error('Me endpoint error:', errorData);
        throw new Error('Invalid access token. Please check your token and try again.');
      }
      
      const meData = await meResponse.json();
      const finalUserId = meData.id;
      console.log('Got user ID:', finalUserId, 'Username:', meData.username);
      
      setUserId(finalUserId); // Update the userId state with numeric ID

      setMessage({ 
        type: 'success', 
        text: `연결 성공! Username: @${meData.username || meData.name}` 
      });

      // Save to config
      await saveThreadsConfig(orgId, {
        accessToken,
        userId: finalUserId,
        username: meData.username || meData.name,
        enabled: true,
      });
      
      console.log('Config saved successfully');
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setMessage({ type: 'error', text: error.message || 'Connection failed. Please check your credentials.' });
    } finally {
      setTesting(false);
    }
  };

  const isAdmin = memberRole === 'owner' || memberRole === 'admin';

  if (loading) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="text-center py-8 text-gray-400">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Connection Status</h2>
          {config?.username ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              Not Connected
            </span>
          )}
        </div>

        {config?.username && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
              @
            </div>
            <div>
              <p className="text-white font-medium">@{config.username}</p>
              <p className="text-gray-400 text-sm">User ID: {config.userId}</p>
            </div>
          </div>
        )}
      </div>

      {/* API Credentials */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">API Credentials</h2>
        
        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="text-blue-400 font-medium mb-2">How to get your credentials:</h3>
            <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Meta for Developers</a></li>
              <li>Create or select your app</li>
              <li>Add Threads API product</li>
              <li>Generate a Long-Lived Access Token and paste below</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={!isAdmin}
              placeholder="Enter your Threads API access token"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--gradient-start)] disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            />
          </div>


          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={testing || !accessToken}
                className="flex-1 btn-secondary py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !accessToken}
                className="flex-1 btn-primary py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Token Info */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Important Notes</h2>
        <ul className="text-gray-400 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">⚠️</span>
            Long-lived tokens expire after 60 days. You'll need to refresh them periodically.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">ℹ️</span>
            Your access token is stored securely and never exposed to other team members.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            Make sure your app has the <code className="px-1 py-0.5 rounded bg-white/10">threads_basic</code> and <code className="px-1 py-0.5 rounded bg-white/10">threads_content_publish</code> permissions.
          </li>
        </ul>
      </div>
    </div>
  );
}

// Team Settings Tab (placeholder)
function TeamSettings({ orgId, memberRole, t }: { orgId: string; memberRole: string | null; t: any }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Team Members</h2>
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-4">👥</p>
        <p>Team management coming soon</p>
        <p className="text-sm mt-1">You'll be able to invite members and manage roles here.</p>
      </div>
    </div>
  );
}
