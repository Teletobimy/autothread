'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <span className="text-xl font-bold text-white">Utilix</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                {t.nav.features}
              </Link>
              <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                {t.nav.pricing}
              </Link>
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                {t.nav.login}
              </Link>
              <LanguageSelector />
              <Link
                href="/dashboard/threads"
                className="btn-primary px-5 py-2.5 rounded-lg text-white font-medium"
              >
                {t.nav.getStarted}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-3 md:hidden">
              <LanguageSelector />
              <button className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
                <span className="font-bold text-white">Utilix</span>
              </div>
              <p className="text-gray-500 text-sm">
                {t.footer.tagline}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t.footer.product}</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">{t.footer.features}</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">{t.footer.pricing}</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">{t.footer.changelog}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t.footer.company}</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">{t.footer.about}</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">{t.footer.blog}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">{t.footer.contact}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500 text-sm">
            {t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
          </div>
        </div>
      </footer>
    </div>
  );
}
