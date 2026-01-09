import Link from 'next/link';

const features = [
  {
    icon: '🧵',
    title: 'Threads Auto Poster',
    description: 'AI-generated content automatically posted to Meta Threads. Schedule, translate, and manage your social presence.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: '📊',
    title: 'Sheets Manager',
    description: 'Seamlessly sync data between Google Sheets and your applications. Automate data workflows effortlessly.',
    color: 'from-green-500 to-emerald-500',
    comingSoon: true,
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    description: 'Powered by Gemini AI for content generation, translation, and intelligent automation.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🔗',
    title: 'URL Shortener',
    description: 'Create branded short links with analytics. Track clicks and optimize your marketing campaigns.',
    color: 'from-orange-500 to-amber-500',
    comingSoon: true,
  },
  {
    icon: '📝',
    title: 'Content Scheduler',
    description: 'Plan and schedule your content across multiple platforms. Never miss the perfect posting time.',
    color: 'from-purple-500 to-violet-500',
    comingSoon: true,
  },
  {
    icon: '📈',
    title: 'Analytics Dashboard',
    description: 'Track performance across all your tools. Get insights to optimize your workflow.',
    color: 'from-indigo-500 to-blue-500',
    comingSoon: true,
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '1 tool access',
      '100 posts/month',
      '1 team member',
      'Community support',
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For growing teams',
    features: [
      'All tools access',
      '1,000 posts/month',
      '5 team members',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
    ],
    cta: 'Start Pro Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Unlimited posts',
      'Unlimited members',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

export default function LandingPage() {
  return (
    <div className="hero-pattern grid-pattern">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm text-gray-300">Now with Gemini AI Integration</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            Supercharge Your
            <br />
            <span className="gradient-text">Workflow with AI</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            AI-powered automation tools for content generation, social media management, and team collaboration. Built for modern teams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <Link
              href="/signup"
              className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg glow"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="btn-secondary px-8 py-4 rounded-xl text-white font-semibold text-lg"
            >
              See Features
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex items-center justify-center gap-8 text-gray-500 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Cancel anytime</span>
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
              Everything you need to
              <br />
              <span className="gradient-text">automate your work</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A suite of powerful AI tools designed to save you time and boost productivity.
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
                    Coming Soon
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
              Simple, transparent
              <br />
              <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
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
                {plan.featured && (
                  <div className="inline-block px-3 py-1 rounded-full gradient-bg text-xs text-white font-medium mb-4">
                    Most Popular
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
                Ready to get started?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of teams already using Utilix to automate their workflows.
              </p>
              <Link
                href="/signup"
                className="inline-block btn-primary px-10 py-4 rounded-xl text-white font-semibold text-lg glow animate-pulse-glow"
              >
                Start Free Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
