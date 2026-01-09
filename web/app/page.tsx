'use client';

import { useState } from 'react';
import { ContentGenerator } from '@/components/ContentGenerator';
import { AutoTranslator } from '@/components/AutoTranslator';
import { AutoPoster } from '@/components/AutoPoster';
import { Settings } from '@/components/Settings';
import { AuthButton } from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'generate' | 'translate' | 'post' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <AuthButton />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              🧵 Threads Auto Poster
            </h1>
            <p className="text-gray-600 text-lg">AI-powered content generation and auto-posting for Threads</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-3">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'generate'}
              onClick={() => setActiveTab('generate')}
              icon="📝"
              label="콘텐츠 생성"
            />
            <TabButton
              active={activeTab === 'translate'}
              onClick={() => setActiveTab('translate')}
              icon="🌐"
              label="자동 번역"
            />
            <TabButton
              active={activeTab === 'post'}
              onClick={() => setActiveTab('post')}
              icon="🚀"
              label="자동 게시"
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon="⚙️"
              label="설정"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'generate' && <ContentGenerator />}
          {activeTab === 'translate' && <AutoTranslator />}
          {activeTab === 'post' && <AutoPoster />}
          {activeTab === 'settings' && <Settings />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Built with Next.js 15 + TypeScript + Tailwind CSS</p>
        </div>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="mr-2 text-lg">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
