'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { addToQueue, getQueue, Post } from '@/lib/firestore';
import { api } from '@/lib/config';

type TabType = 'generate' | 'translate' | 'queue' | 'post';

export default function ThreadsPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [activeTab, setActiveTab] = useState<TabType>('generate');

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
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
          <h1 className="text-2xl font-bold text-white">Threads Auto Poster</h1>
          <p className="text-gray-400">AI-powered content generation and auto-posting</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5">
        <TabButton active={activeTab === 'generate'} onClick={() => setActiveTab('generate')} label="Generate" />
        <TabButton active={activeTab === 'translate'} onClick={() => setActiveTab('translate')} label="Translate" />
        <TabButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} label="Queue" />
        <TabButton active={activeTab === 'post'} onClick={() => setActiveTab('post')} label="Post" />
      </div>

      {/* Content */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        {activeTab === 'generate' && <GenerateContent orgId={currentOrg.id} userId={user?.uid || ''} />}
        {activeTab === 'translate' && <TranslateContent orgId={currentOrg.id} />}
        {activeTab === 'queue' && <QueueContent orgId={currentOrg.id} />}
        {activeTab === 'post' && <PostContent orgId={currentOrg.id} />}
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
function GenerateContent({ orgId, userId }: { orgId: string; userId: string }) {
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
        {loading ? 'Generating...' : 'Generate Content'}
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
function TranslateContent({ orgId }: { orgId: string }) {
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
        {loading ? 'Translating...' : 'Translate Pending Posts'}
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
function QueueContent({ orgId }: { orgId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'posted'>('all');

  useEffect(() => {
    loadPosts();
  }, [orgId, filter]);

  const loadPosts = async () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Post Queue</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'posted')}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="posted">Posted</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No posts in queue</p>
          <p className="text-sm mt-1">Generate content to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-white text-sm flex-1">{post.text}</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  post.status === 'posted' ? 'bg-green-500/20 text-green-400' :
                  post.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {post.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>{post.language}</span>
                <span>{post.model}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Post Content Tab
function PostContent({ orgId }: { orgId: string }) {
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
        {loading ? 'Starting...' : 'Start Auto Posting'}
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
