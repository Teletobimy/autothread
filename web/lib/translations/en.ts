import type { TranslationKeys } from './ko';

export const en: TranslationKeys = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    confirm: 'Confirm',
    close: 'Close',
  },

  // Navigation
  nav: {
    features: 'Features',
    pricing: 'Pricing',
    login: 'Login',
    signup: 'Sign Up',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    logout: 'Logout',
  },

  // Landing Page
  landing: {
    badge: 'Now with Gemini AI Integration',
    headline: 'Supercharge Your',
    headlineHighlight: 'Workflow with AI',
    subheadline: 'AI-powered automation tools for content generation, social media management, and team collaboration. Built for modern teams.',
    ctaStart: 'Get Started Free',
    ctaFeatures: 'See Features',
    trustBadge1: 'No credit card required',
    trustBadge2: 'Free forever plan',
    trustBadge3: 'Cancel anytime',
  },

  // Features Section
  features: {
    title: 'Everything you need to',
    titleHighlight: 'automate your work',
    subtitle: 'A suite of powerful AI tools designed to save you time and boost productivity.',
    threads: {
      title: 'Threads Auto Poster',
      description: 'AI-generated content automatically posted to Meta Threads. Schedule, translate, and manage your social presence.',
    },
    sheets: {
      title: 'Sheets Manager',
      description: 'Seamlessly sync data between Google Sheets and your applications. Automate data workflows effortlessly.',
    },
    ai: {
      title: 'AI Assistant',
      description: 'Powered by Gemini AI for content generation, translation, and intelligent automation.',
    },
    url: {
      title: 'URL Shortener',
      description: 'Create branded short links with analytics. Track clicks and optimize your marketing campaigns.',
    },
    scheduler: {
      title: 'Content Scheduler',
      description: 'Plan and schedule your content across multiple platforms. Never miss the perfect posting time.',
    },
    analytics: {
      title: 'Analytics Dashboard',
      description: 'Track performance across all your tools. Get insights to optimize your workflow.',
    },
    comingSoon: 'Coming Soon',
  },

  // Pricing Section
  pricing: {
    title: 'Simple, transparent',
    titleHighlight: 'pricing',
    subtitle: 'Start free, upgrade when you need more. No hidden fees.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    perMonth: '/month',
    free: {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '1 tool access',
        '100 posts/month',
        '1 team member',
        'Community support',
      ],
      cta: 'Start Free',
    },
    pro: {
      name: 'Pro',
      price: '$19',
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
      popular: 'Most Popular',
    },
    enterprise: {
      name: 'Enterprise',
      price: '$49',
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
    },
  },

  // CTA Section
  cta: {
    title: 'Ready to get started?',
    subtitle: 'Join thousands of teams already using Utilix to automate their workflows.',
    button: 'Start Free Today',
  },

  // Footer
  footer: {
    tagline: 'AI-powered tools for modern teams.',
    product: 'Product',
    features: 'Features',
    pricing: 'Pricing',
    changelog: 'Changelog',
    company: 'Company',
    about: 'About',
    blog: 'Blog',
    contact: 'Contact',
    legal: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    copyright: '© {year} Utilix. All rights reserved.',
  },

  // Auth
  auth: {
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot password?',
    orContinueWith: 'Or continue with',
    google: 'Continue with Google',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signupNow: 'Sign up now',
    loginNow: 'Login now',
    welcomeBack: 'Welcome back',
    loginSubtitle: 'Login to your account',
    createAccount: 'Create Account',
    signupSubtitle: 'Start for free',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome, {name}',
    overview: 'Overview',
    tools: 'Tools',
    settings: 'Settings',
    threads: {
      title: 'Threads Poster',
      description: 'Generate content with AI and auto-post to Threads.',
      generate: 'Generate Content',
      queue: 'Queue',
      posted: 'Posted',
      pending: 'Pending',
      failed: 'Failed',
    },
    stats: {
      totalPosts: 'Total Posts',
      thisMonth: 'This Month',
      successRate: 'Success Rate',
      avgEngagement: 'Avg. Engagement',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    profile: 'Profile',
    organization: 'Organization',
    billing: 'Billing',
    notifications: 'Notifications',
    api: 'API Integration',
    language: 'Language',
    timezone: 'Timezone',
    save: 'Save',
    saved: 'Saved',
  },

  // Onboarding
  onboarding: {
    welcome: 'Welcome to Utilix!',
    subtitle: "Let's complete a few settings before we begin.",
    step1: {
      title: 'Create Organization',
      description: 'Enter your team or project name.',
      placeholder: 'e.g., My Company',
    },
    step2: {
      title: 'Choose Your First Tool',
      description: 'Select a tool to get started.',
    },
    step3: {
      title: 'All Done!',
      description: "You're all set up.",
    },
    finish: 'Go to Dashboard',
  },
};
