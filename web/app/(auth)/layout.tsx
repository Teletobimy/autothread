'use client';

import Link from 'next/link';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen hero-pattern grid-pattern flex flex-col">
      {/* Simple header */}
      <header className="p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <span className="text-xl font-bold text-white">Utilix</span>
        </Link>
        <LanguageSelector />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
