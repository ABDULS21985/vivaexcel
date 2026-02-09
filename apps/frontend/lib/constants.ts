export const SITE_NAME = 'KTBlog';
export const SITE_DESCRIPTION = 'Best-of-class blog platform delivering expert insights, in-depth tutorials, and thought leadership.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://drkatangablog.com';
export const SITE_LOGO = '/images/logo.svg';

export const CATEGORIES = [
  { name: 'Technology', slug: 'technology', color: '#3B82F6', icon: 'Cpu' },
  { name: 'Design', slug: 'design', color: '#EC4899', icon: 'Palette' },
  { name: 'Productivity', slug: 'productivity', color: '#10B981', icon: 'Zap' },
  { name: 'AI & Machine Learning', slug: 'ai-machine-learning', color: '#8B5CF6', icon: 'Brain' },
  { name: 'Web Development', slug: 'web-development', color: '#F59E0B', icon: 'Code' },
  { name: 'Career Growth', slug: 'career-growth', color: '#EF4444', icon: 'TrendingUp' },
];

export const MEMBERSHIP_TIERS = [
  { name: 'Free', monthlyPrice: 0, annualPrice: 0 },
  { name: 'Basic', monthlyPrice: 5, annualPrice: 48 },
  { name: 'Pro', monthlyPrice: 15, annualPrice: 144 },
  { name: 'Premium', monthlyPrice: 30, annualPrice: 288 },
];

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/ktblog',
  linkedin: 'https://linkedin.com/company/ktblog',
  github: 'https://github.com/ktblog',
};
