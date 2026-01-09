'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { getQueue, deletePost, updatePostText, Post } from '@/lib/firestore';
import { api } from '@/lib/config';

type TabType = 'generate' | 'translate' | 'queue' | 'post';

export default function ThreadsPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('generate');

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl">
          🧵
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{t.dashboard.threads.title}</h1>
          <p className="text-gray-400">{t.dashboard.threads.description}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5">
        <TabButton active={activeTab === 'generate'} onClick={() => setActiveTab('generate')} label={t.dashboard.threads.generate} />
        <TabButton active={activeTab === 'translate'} onClick={() => setActiveTab('translate')} label="Translate" />
        <TabButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} label={t.dashboard.threads.queue} />
        <TabButton active={activeTab === 'post'} onClick={() => setActiveTab('post')} label="Post" />
      </div>

      {/* Content */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        {activeTab === 'generate' && <GenerateContent orgId={currentOrg.id} userId={user?.uid || ''} t={t} />}
        {activeTab === 'translate' && <TranslateContent orgId={currentOrg.id} t={t} />}
        {activeTab === 'queue' && <QueueContent orgId={currentOrg.id} t={t} />}
        {activeTab === 'post' && <PostContent orgId={currentOrg.id} t={t} />}
      </div>
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

// Generate Content Tab
function GenerateContent({ orgId, userId, t }: { orgId: string; userId: string; t: any }) {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(api.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          prompt,
          count,
          save_to_firestore: true,
          org_id: orgId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data.message);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          placeholder="Describe the content you want to generate..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--gradient-start)] resize-none min-h-[150px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of posts to generate
        </label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          disabled={loading}
          min={1}
          max={20}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--gradient-start)]"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full btn-primary py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t.common.loading : t.dashboard.threads.generate}
      </button>

      {result && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
          {result}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

// Translate Content Tab
function TranslateContent({ orgId, t }: { orgId: string; t: any }) {
  const [targetLang, setTargetLang] = useState('english');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(api.translate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          target_lang: targetLang,
          org_id: orgId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setResult(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Target Language
        </label>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--gradient-start)]"
        >
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="japanese">Japanese</option>
          <option value="chinese">Chinese</option>
          <option value="korean">Korean</option>
        </select>
      </div>

      <p className="text-gray-400 text-sm">
        This will translate all pending Korean posts to the selected language.
      </p>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="w-full btn-primary py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t.common.loading : 'Translate Pending Posts'}
      </button>

      {result && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
          {result}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

// Queue Content Tab
function QueueContent({ orgId, t }: { orgId: string; t: any }) {
  const { isDemo } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'posted'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [orgId, filter, isDemo]);

  const loadPosts = async () => {
    // Skip loading in demo mode - show empty state
    if (isDemo) {
      setPosts([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await getQueue(orgId, status);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeletingId(postId);
    try {
      await deletePost(orgId, postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (post: Post) => {
    setEditingId(post.id || null);
    setEditText(post.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;

    setSaving(true);
    try {
      await updatePostText(orgId, editingId, editText.trim());
      setPosts(posts.map(p => 
        p.id === editingId ? { ...p, text: editText.trim() } : p
      ));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-white">{t.dashboard.threads.queue}</h3>
          <span className="px-2 py-1 rounded-full bg-white/10 text-gray-400 text-xs">
            {posts.length} posts
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPosts}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'posted')}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          >
            <option value="all">{t.common.all}</option>
            <option value="pending">{t.dashboard.threads.pending}</option>
            <option value="posted">{t.dashboard.threads.posted}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">{t.common.loading}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">{isDemo ? '🎮' : '📭'}</div>
          {isDemo ? (
            <>
              <p>데모 모드에서는 대기열이 저장되지 않습니다</p>
              <p className="text-sm mt-1">로그인 후 콘텐츠를 저장하세요</p>
            </>
          ) : (
            <>
              <p>No posts in queue</p>
              <p className="text-sm mt-1">Generate content to get started</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                {editingId === post.id ? (
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[var(--gradient-start)] resize-none min-h-[100px]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving || !editText.trim()}
                        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        {saving ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-400 text-sm hover:bg-white/20 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white text-sm flex-1 whitespace-pre-wrap">{post.text}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                    post.status === 'posted' ? 'bg-green-500/20 text-green-400' :
                    post.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {post.status === 'posted' ? t.dashboard.threads.posted : 
                     post.status === 'pending' ? t.dashboard.threads.pending : 
                     t.dashboard.threads.failed}
                  </span>
                  {post.status === 'pending' && editingId !== post.id && (
                    <>
                      <button
                        onClick={() => handleStartEdit(post)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title={t.common.edit}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => post.id && handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title={t.common.delete}
                      >
                        {deletingId === post.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {post.language}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {post.model}
                </span>
                {post.permalink && (
                  <a 
                    href={post.permalink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Post Content Tab
function PostContent({ orgId, t }: { orgId: string; t: any }) {
  const [interval, setInterval] = useState(60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(api.post, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interval_minutes: interval,
          org_id: orgId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start posting');
      }

      setResult(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Post Interval (minutes)
        </label>
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value) || 60)}
          disabled={loading}
          min={1}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--gradient-start)]"
        />
        <p className="mt-2 text-gray-500 text-sm">
          Posts will be published one at a time with this interval between them.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-yellow-400 text-sm">
          ⚠️ Make sure you have connected your Threads account in Settings before posting.
        </p>
      </div>

      <button
        onClick={handlePost}
        disabled={loading}
        className="w-full btn-primary py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t.common.loading : 'Start Auto Posting'}
      </button>

      {result && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
          {result}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
