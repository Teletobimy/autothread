'use client';

import Link from 'next/link';
import { useOrganization } from '@/contexts/OrganizationContext';

const tools = [
  {
    id: 'threads',
    name: 'Threads Auto Poster',
    description: 'AI-generated content for Meta Threads',
    icon: '🧵',
    href: '/dashboard/threads',
    color: 'from-pink-500 to-rose-500',
    status: 'active',
  },
  {
    id: 'sheets',
    name: 'Sheets Manager',
    description: 'Google Sheets automation',
    icon: '📊',
    href: '/dashboard/sheets',
    color: 'from-green-500 to-emerald-500',
    status: 'coming_soon',
  },
  {
    id: 'url',
    name: 'URL Shortener',
    description: 'Create branded short links',
    icon: '🔗',
    href: '/dashboard/url',
    color: 'from-orange-500 to-amber-500',
    status: 'coming_soon',
  },
];

const quickStats = [
  { label: 'Posts This Month', value: '47', change: '+12%' },
  { label: 'Active Tools', value: '1', change: '' },
  { label: 'Team Members', value: '1', change: '' },
];

export default function DashboardPage() {
  const { currentOrg, userProfile } = useOrganization();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {userProfile?.displayName?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with {currentOrg?.name || 'your organization'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              {stat.change && (
                <span className="text-green-400 text-sm">{stat.change}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Your Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.status === 'active' ? tool.href : '#'}
              className={`feature-card glass rounded-2xl border border-white/10 p-6 block ${
                tool.status === 'coming_soon' ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl`}>
                  {tool.icon}
                </div>
                {tool.status === 'coming_soon' && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                    Coming Soon
                  </span>
                )}
                {tool.status === 'active' && (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-xs text-green-400">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{tool.name}</h3>
              <p className="text-gray-400 text-sm">{tool.description}</p>
            </Link>
          ))}

          {/* Add Tool Card */}
          <div className="glass rounded-2xl border border-dashed border-white/20 p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl mb-4">
              ➕
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">More Tools Coming</h3>
            <p className="text-gray-400 text-sm">
              We&apos;re building more AI tools for you
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No recent activity</p>
            <p className="text-sm mt-1">Start using tools to see your activity here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
