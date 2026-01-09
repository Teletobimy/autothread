'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🧵',
      title: t.features.threads.title,
      description: t.features.threads.description,
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: '📊',
      title: t.features.sheets.title,
      description: t.features.sheets.description,
      color: 'from-green-500 to-emerald-500',
      comingSoon: true,
    },
    {
      icon: '🤖',
      title: t.features.ai.title,
      description: t.features.ai.description,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🔗',
      title: t.features.url.title,
      description: t.features.url.description,
      color: 'from-orange-500 to-amber-500',
      comingSoon: true,
    },
    {
      icon: '📝',
      title: t.features.scheduler.title,
      description: t.features.scheduler.description,
      color: 'from-purple-500 to-violet-500',
      comingSoon: true,
    },
    {
      icon: '📈',
      title: t.features.analytics.title,
      description: t.features.analytics.description,
      color: 'from-indigo-500 to-blue-500',
      comingSoon: true,
    },
  ];

  const plans = [
    {
      name: t.pricing.free.name,
      price: t.pricing.free.price,
      period: t.pricing.perMonth,
      description: t.pricing.free.description,
      features: t.pricing.free.features,
      cta: t.pricing.free.cta,
      featured: false,
    },
    {
      name: t.pricing.pro.name,
      price: t.pricing.pro.price,
      period: t.pricing.perMonth,
      description: t.pricing.pro.description,
      features: t.pricing.pro.features,
      cta: t.pricing.pro.cta,
      featured: true,
      popular: t.pricing.pro.popular,
    },
    {
      name: t.pricing.enterprise.name,
      price: t.pricing.enterprise.price,
      period: t.pricing.perMonth,
      description: t.pricing.enterprise.description,
      features: t.pricing.enterprise.features,
      cta: t.pricing.enterprise.cta,
      featured: false,
    },
  ];

  return (
    <div className="hero-pattern grid-pattern">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm text-gray-300">{t.landing.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            {t.landing.headline}
            <br />
            <span className="gradient-text">{t.landing.headlineHighlight}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            {t.landing.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <Link
              href="/signup"
              className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg glow"
            >
              {t.landing.ctaStart}
            </Link>
            <Link
              href="#features"
              className="btn-secondary px-8 py-4 rounded-xl text-white font-semibold text-lg"
            >
              {t.landing.ctaFeatures}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-gray-500 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{t.landing.trustBadge1}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{t.landing.trustBadge2}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{t.landing.trustBadge3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.features.title}
              <br />
              <span className="gradient-text">{t.features.titleHighlight}</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card glass rounded-2xl p-6 border border-white/10 relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {feature.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                    {t.features.comingSoon}
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.pricing.title}
              <br />
              <span className="gradient-text">{t.pricing.titleHighlight}</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t.pricing.subtitle}
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card rounded-2xl p-8 border ${
                  plan.featured
                    ? 'border-[var(--gradient-start)] bg-gradient-to-b from-[var(--gradient-start)]/10 to-transparent'
                    : 'border-white/10 glass'
                }`}
              >
                {plan.featured && plan.popular && (
                  <div className="inline-block px-3 py-1 rounded-full gradient-bg text-xs text-white font-medium mb-4">
                    {plan.popular}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-gray-400 mt-1 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                    plan.featured
                      ? 'btn-primary text-white'
                      : 'btn-secondary text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-border rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 hero-pattern opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {t.cta.title}
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
                {t.cta.subtitle}
              </p>
              <Link
                href="/signup"
                className="inline-block btn-primary px-10 py-4 rounded-xl text-white font-semibold text-lg glow animate-pulse-glow"
              >
                {t.cta.button}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
