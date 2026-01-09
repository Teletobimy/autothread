import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for individuals getting started',
    features: [
      { text: '1 tool access', included: true },
      { text: '100 posts/month', included: true },
      { text: '1 team member', included: true },
      { text: 'Community support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom branding', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For growing teams and businesses',
    features: [
      { text: 'All tools access', included: true },
      { text: '1,000 posts/month', included: true },
      { text: '5 team members', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom branding', included: true },
      { text: 'API access', included: false },
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
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited posts', included: true },
      { text: 'Unlimited members', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay via invoice.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! The Pro plan comes with a 14-day free trial. No credit card required to start.',
  },
  {
    question: 'What happens if I exceed my post limit?',
    answer: 'We\'ll notify you when you\'re approaching your limit. You can either upgrade your plan or wait until the next billing cycle.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
  },
];

export default function PricingPage() {
  return (
    <div className="hero-pattern grid-pattern pt-32 pb-20 px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Choose your
          <span className="gradient-text"> plan</span>
        </h1>
        <p className="text-xl text-gray-400">
          Start free and scale as you grow. All plans include core features.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card rounded-2xl p-8 border ${
              plan.featured
                ? 'border-[var(--gradient-start)] bg-gradient-to-b from-[var(--gradient-start)]/10 to-transparent scale-105'
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
                <li key={feature.text} className="flex items-center gap-3">
                  {feature.included ? (
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                    {feature.text}
                  </span>
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

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group glass rounded-xl border border-white/10 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-white">{faq.question}</span>
                <svg
                  className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
